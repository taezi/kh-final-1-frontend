// src/pages/culture/CultureViewPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import dayjs from "dayjs";
import "../../css/CulturePage.css";
import "../../css/CultureViewPage.css";
import { getEventDetail } from "../../service/placeAPI";
import {
  normalizeEvent,
  mergeEvent,
  sanitizeDeep,
} from "../../utils/eventNormalizer";

/** 설명 추출: HTML 우선, 없으면 텍스트 후보 순회 */
function pickDescription(data) {
  if (!data) return { html: "", text: "" };

  const html = (data.descriptionHtml || "").trim();
  if (html) return { html, text: "" };

  const candidates = [
    data.summary,
    data.description,
    data._csv?.description,
    data._raw?.description,
    data._raw?.overview,
    data._raw?.content,
  ];

  const text = (
    candidates.find((v) => typeof v === "string" && v.trim()) || ""
  ).trim();
  return { html: "", text };
}

export default function CultureViewPage() {
  const { id } = useParams();
  const loc = useLocation();

  // 목록에서 넘어온 row 즉시 사용(여기도 sanitize + normalize)
  const rowFromList =
    loc.state && typeof loc.state === "object" ? loc.state : null;
  const [data, setData] = useState(
    rowFromList ? normalizeEvent(sanitizeDeep(rowFromList)) : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  useEffect(() => {
    const initial = rowFromList
      ? normalizeEvent(sanitizeDeep(rowFromList))
      : null;
    setData(initial);
    setError("");

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const raw = await getEventDetail({ id }); // 상세 호출
        if (!alive) return;

        // 🔎 디버깅: 상세 원본/정규화 결과 로그
        // (필요 시 잠깐 켜서 어떤 필드가 빈값으로 오는지 확인)
        // console.log("[detail raw]", raw);

        const detailed = normalizeEvent(raw); // 내부에서 sanitizeDeep 수행
        // console.log("[detail normalized]", detailed);

        setData((prev) => mergeEvent(prev, detailed));
      } catch (e) {
        if (!alive) return;
        if (!rowFromList) setError("상세 정보를 불러오지 못했어요.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 이미지
  const imgs = useMemo(() => {
    const list = data?.images?.length
      ? data.images
      : data?.thumbUrl
      ? [data.thumbUrl]
      : [];
    return list.length ? list : ["https://picsum.photos/1200/800?blur=2"];
  }, [data]);

  // 기간 텍스트
  const periodText = useMemo(() => {
    if (!data) return "";
    const s = data.dateStart
      ? dayjs(data.dateStart).format("YYYY.MM.DD")
      : data._csv?.startdateRaw;
    const e = data.dateEnd
      ? dayjs(data.dateEnd).format("YYYY.MM.DD")
      : data._csv?.enddateRaw || s;
    if (!s && !e) return "";
    return `${s || ""}${s && e ? " ~ " : ""}${e || ""}`;
  }, [data]);

  // 요금/웹/장소/주소
  const fee = (data?.feeText || "").trim();
  const website = (data?.website || data?._csv?.portalurl || "").trim();
  const address = (data?.address || "").trim();
  const placeRaw = (data?.place || "").trim();
  const orgRaw = (data?._csv?.organizationname || "").trim();
  const hasMapTarget = Boolean(address || placeRaw || orgRaw);

  // 지도
  const gmapEmbedUrl = useMemo(() => {
    const q = encodeURIComponent(address || placeRaw || orgRaw || "서울");
    return `https://www.google.com/maps?q=${q}&hl=ko&z=16&output=embed`;
  }, [address, placeRaw, orgRaw]);

  const naverMapLink = useMemo(() => {
    const q = encodeURIComponent(address || placeRaw || "서울");
    return `https://map.naver.com/v5/search/${q}`;
  }, [address, placeRaw]);

  // 로딩 스켈레톤
  if (!data && loading) {
    return (
      <div className="page cv-wrap">
        <div className="cv-skel hero" />
        <div className="cv-skel text" />
      </div>
    );
  }

  // 에러
  if (error || !data) {
    return (
      <div className="page cv-wrap">
        <p className="cv-error">{error || "데이터가 없습니다."}</p>
        <div className="cv-footnav">
          <Link to="/culture" className="cv-btn">
            목록으로
          </Link>
        </div>
      </div>
    );
  }

  // 설명 후보 추출 (HTML 우선)
  const { html: descHtml, text: descText } = pickDescription(data);

  return (
    <div className="page cv-wrap">
      <div className="cv-topline center">
        {data._csv?.category && (
          <span className="cv-chip">{data._csv.category}</span>
        )}
        {data.gu && <span className="cv-chip">{data.gu}</span>}
      </div>

      <h1 className="cv-title center">{data.title}</h1>

      {/* Hero 이미지 */}
      <div className="cv-heroimg">
        <img src={imgs[0]} alt={data.title} />
      </div>
      {imgs.length > 1 && (
        <div className="cv-dots">
          {imgs.slice(0, 6).map((_, i) => (
            <i key={i} className={`dot ${i === 0 ? "is-on" : ""}`} />
          ))}
        </div>
      )}

      {/* 정보 카드 */}
      <section className="cv-card">
        <dl className="cv-dl">
          {periodText && (
            <>
              <dt>행사 기간</dt>
              <dd>{periodText}</dd>
            </>
          )}

          {(() => {
            const venue = orgRaw || placeRaw;
            return venue ? (
              <>
                <dt>장소</dt>
                <dd>
                  {venue}
                  {data.gu ? ` · ${data.gu}` : ""}
                </dd>
              </>
            ) : null;
          })()}

          {orgRaw && orgRaw !== placeRaw && (
            <>
              <dt>기관명</dt>
              <dd>{orgRaw}</dd>
            </>
          )}

          {data._csv?.category && (
            <>
              <dt>분류</dt>
              <dd>{data._csv.category}</dd>
            </>
          )}
          {data._csv?.targetaudience && (
            <>
              <dt>관람 대상</dt>
              <dd>{data._csv.targetaudience}</dd>
            </>
          )}

          {fee && (
            <>
              <dt>이용 요금</dt>
              <dd>{fee}</dd>
            </>
          )}

          {address && address !== orgRaw && address !== placeRaw && (
            <>
              <dt>주소</dt>
              <dd>{address}</dd>
            </>
          )}

          {data.phone && (
            <>
              <dt>전화번호</dt>
              <dd>{data.phone}</dd>
            </>
          )}
          {(data.openHours || data.timeText) && (
            <>
              <dt>운영 시간</dt>
              <dd>{data.openHours || data.timeText}</dd>
            </>
          )}
          {data.closedDays && (
            <>
              <dt>휴무일</dt>
              <dd>{data.closedDays}</dd>
            </>
          )}

          {website && (
            <>
              <dt>웹사이트</dt>
              <dd>
                <a
                  className="cv-link"
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                >
                  {website}
                </a>
              </dd>
            </>
          )}
        </dl>

        {/* 지도 */}
        {hasMapTarget && (
          <div className="cv-mapbox">
            <iframe
              title="event-map"
              src={gmapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="cv-maphint">
              지도가 안 보이면{" "}
              <a
                href={naverMapLink}
                target="_blank"
                rel="noreferrer"
                className="cv-maplink"
              >
                네이버지도에서 보기
              </a>
            </div>
          </div>
        )}
      </section>

      {/* 소개 섹션: HTML > TEXT 순 */}
      {(descHtml || descText) && (
        <section className="cv-card cv-desccard cv-desccard--lower">
          <h2 className="cv-h2">소개</h2>
          {descHtml ? (
            <div
              className="cv-desc"
              dangerouslySetInnerHTML={{ __html: descHtml }}
            />
          ) : (
            <p className="cv-desc">{descText}</p>
          )}
        </section>
      )}

      {/* 태그 */}
      {Array.isArray(data.tags) && data.tags.length > 0 && (
        <section className="cv-card">
          <div className="cv-tags">
            {data.tags.map((t, i) => (
              <span key={i} className="cv-tag">
                #{t}
              </span>
            ))}
          </div>
        </section>
      )}

      <div className="cv-footnav">
        <Link to="/culture" className="cv-btn">
          목록으로
        </Link>
      </div>
    </div>
  );
}
