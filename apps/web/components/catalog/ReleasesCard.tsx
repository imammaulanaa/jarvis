import Image from "next/image"
import { Tag, ExternalLink, Package } from "lucide-react"
import { parseGitHubUrl, fetchReleases } from "@/lib/github"

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ""
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1)  return "today"
  if (days < 30) return days + "d ago"
  const months = Math.floor(days / 30)
  if (months < 12) return months + "mo ago"
  return Math.floor(months / 12) + "y ago"
}

function truncate(text: string, max: number): string {
  const clean = text
    .replace(/#+ /g, "")
    .replace(/\r/g, "")
    .split("\n")
    .filter(l => l.trim().length > 0)
    .join(" · ")
  return clean.length > max ? clean.slice(0, max) + "..." : clean
}

interface Props {
  repoUrl: string
}

export default async function ReleasesCard({ repoUrl }: Props) {
  const parsed = parseGitHubUrl(repoUrl)
  if (!parsed) return null

  const { owner, repo } = parsed
  const releases = await fetchReleases(owner, repo)

  if (releases.length === 0) return null

  return (
    <div
      className="rounded-xl border p-5 mb-6"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package size={15} style={{ color: "var(--accent)" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Releases
          </h2>
        </div>
        
        <a href={"https://github.com/" + owner + "/" + repo + "/releases"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] transition-colors hover:text-[var(--accent)]"
          style={{ color: "var(--text-muted)" }}
        >
          View all
          <ExternalLink size={10} />
        </a>
      </div>

      <div className="flex flex-col">
        {releases.map((release, i) => {
          const isLatest = i === 0 && !release.prerelease && !release.draft
          const notes    = release.body ? truncate(release.body, 140) : null
          const isLast   = i === releases.length - 1

          return (
            
            <a key={release.id}
              href={release.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 group relative"
            >
              {/* Timeline */}
              {!isLast ? (
                <div className="absolute left-4 top-9 bottom-0 w-px" style={{ background: "var(--border)" }} />
              ) : null}

              {/* Tag icon */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 z-10"
                style={{
                  background: isLatest ? "var(--accent-glow)" : "var(--bg-secondary)",
                  border: "1px solid " + (isLatest ? "var(--accent)" : "var(--border)"),
                }}
              >
                <Tag size={13} style={{ color: isLatest ? "var(--accent)" : "var(--text-muted)" }} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-sm font-bold font-mono-jarvis group-hover:text-[var(--accent)] transition-colors"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {release.tag_name}
                  </span>
                  {isLatest ? (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-medium text-white"
                      style={{ background: "var(--green)" }}
                    >
                      Latest
                    </span>
                  ) : null}
                  {release.prerelease ? (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ background: "var(--amber)", color: "#000" }}
                    >
                      Pre-release
                    </span>
                  ) : null}
                  {release.draft ? (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-mono-jarvis"
                      style={{ background: "var(--bg-secondary)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                    >
                      Draft
                    </span>
                  ) : null}
                </div>

                {release.name && release.name !== release.tag_name ? (
                  <p className="text-xs font-medium mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {release.name}
                  </p>
                ) : null}

                {notes ? (
                  <p className="text-[11px] mt-1 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                    {notes}
                  </p>
                ) : null}

                <div className="flex items-center gap-2 mt-1.5">
                  {release.author?.avatar_url ? (
                    <Image
                      src={release.author.avatar_url}
                      alt={release.author.login}
                      width={14}
                      height={14}
                      className="rounded-full"
                    />
                  ) : null}
                  <span className="text-[10px] font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
                    {release.author?.login ?? "unknown"}
                    {" · "}
                    {timeAgo(release.published_at ?? release.created_at)}
                  </span>
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}