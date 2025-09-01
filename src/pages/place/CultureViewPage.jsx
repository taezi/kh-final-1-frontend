import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import "../../css/CulturePage.css"; // 공통 버튼/폰트
import "../../css/CultureViewPage.css"; // 상세 전용
import { getEventDetail } from "../../service/placeAPI";
import { normalizeEvent } from "../../utils/eventNormalizer";

export default function CultureViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const loc = useLocation();

  // 목록에서 넘겨준 row 즉시 사용, 없으면 API 호출
  const rowFromList =
    loc.state && typeof loc.state === "object" ? loc.state : null;
  const [data, setData] = useState(
    rowFromList ? normalizeEvent(rowFromList) : null
  );
  const [loading, setLoading] = useState(!rowFromList);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  useEffect(() => {
    if (rowFromList) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const raw = await getEventDetail({ id }); // 백엔드 준비되면 사용
        if (!alive) return;
        setData(normalizeEvent(raw));
        setError("");
      } catch (e) {
        if (!alive) return;
        setError("상세 정보를 불러오지 못했어요.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, rowFromList]);

  const imgs = useMemo(() => {
    const list = data?.images?.length
      ? data.images
      : data?.thumbUrl
      ? [data.thumbUrl]
      : [];
    return list.length ? list : ["https://picsum.photos/1200/800?blur=2"];
  }, [data]);

  // 행사 기간: 파싱 성공/실패 모두 커버
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

  const website = data?.website || data?._csv?.portalurl || "";
  const address = (data?.address || "").trim();
  const placeRaw = (data?.place || "").trim();
  const orgRaw = (data?._csv?.organizationname || "").trim();

  const hasMapTarget = Boolean(address || placeRaw || orgRaw);

  // 지도: 안정적인 렌더를 위해 구글 임베드 사용(네이버는 보조링크)
  const gmapEmbedUrl = useMemo(() => {
    const q = encodeURIComponent(address || placeRaw || orgRaw || "서울");
    return `https://www.google.com/maps?q=${q}&hl=ko&z=16&output=embed`;
  }, [address, placeRaw, orgRaw]);

  const naverMapLink = useMemo(() => {
    const q = encodeURIComponent(address || placeRaw || "서울");
    return `https://map.naver.com/v5/search/${q}`;
  }, [address, placeRaw]);

  if (loading) {
    return (
      <div className="page cv-wrap">
        <div className="cv-skel hero" />
        <div className="cv-skel text" />
      </div>
    );
  }
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

  // ===== 상단(VisitSeoul 톤) =====
  return (
    <div className="page cv-wrap">
      <div className="cv-topline center">
        {data._csv?.category && (
          <span className="cv-chip">{data._csv.category}</span>
        )}
        {data.gu && <span className="cv-chip">{data.gu}</span>}
      </div>

      <h1 className="cv-title center">{data.title}</h1>

      {/* 큰 이미지 */}
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

      {/* 정보 카드: 중복 제거 규칙 */}
      <section className="cv-card">
        <dl className="cv-dl">
          {periodText && (
            <>
              <dt>행사 기간</dt>
              <dd>{periodText}</dd>
            </>
          )}

          {/* 장소(organizationname > place), 구 표시 */}
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

          {/* 기관명: 장소와 다를 때만 */}
          {orgRaw && orgRaw !== placeRaw && (
            <>
              <dt>기관명</dt>
              <dd>{orgRaw}</dd>
            </>
          )}

          {/* 분류/대상/요금 */}
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
          {(data.feeText || data._csv?.isfree) && (
            <>
              <dt>이용 요금</dt>
              <dd>{data.feeText || data._csv?.isfree}</dd>
            </>
          )}

          {/* 주소: 장소/기관명과 동일하면 숨김 */}
          {address && address !== orgRaw && address !== placeRaw && (
            <>
              <dt>주소</dt>
              <dd>{address}</dd>
            </>
          )}

          {/* 전화/운영시간/휴무일 */}
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

          {/* 웹사이트 */}
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

        {/* 지도 박스(임베드) + 네이버 링크 */}
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

      {/* 원문 설명: 더 아래로 내려 배치 + 여백 강화 */}
      {(data._csv?.description || data.summary || data.descriptionHtml) && (
        <section className="cv-card cv-desccard cv-desccard--lower">
          <h2 className="cv-h2">소개</h2>
          {data.descriptionHtml ? (
            <div
              className="cv-desc"
              dangerouslySetInnerHTML={{ __html: data.descriptionHtml }}
            />
          ) : (
            <p className="cv-desc">{data._csv?.description || data.summary}</p>
          )}
        </section>
      )}

      {/* 태그(있으면) */}
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

      {/* 하단: 목록만 남김 */}
      <div className="cv-footnav">
        <Link to="/culture" className="cv-btn">
          목록으로
        </Link>
      </div>
    </div>
  );
}
