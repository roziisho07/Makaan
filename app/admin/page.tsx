import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import PageIntro from "../components/PageIntro";
import { getCurrentAppUser } from "../lib/getCurrentAppUser";
import { prisma } from "../lib/prisma";

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function AdminPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth/signin?redirect_url=/admin");
  }

  const appUser = await getCurrentAppUser();

  if (!appUser || appUser.role !== "admin") {
    return (
      <div>
        <PageIntro
          eyebrow="Admin"
          title="Restricted"
          description="You do not have permission to access the admin dashboard."
        />
      </div>
    );
  }

  const hasDatabase = Boolean(process.env.DATABASE_URL);

  if (!hasDatabase) {
    return (
      <div>
        <PageIntro
          eyebrow="Admin"
          title="Admin Dashboard"
          description="Database connection is not configured. Add DATABASE_URL to enable operational insights."
        />
        <section className="section-padding pt-0">
          <div className="container-custom">
            <article className="card-soft rounded-2xl p-6 text-muted">
              Set DATABASE_URL in your environment, then reload this page.
            </article>
          </div>
        </section>
      </div>
    );
  }

  const [
    listingCount,
    userCount,
    savedCount,
    inquiryCount,
    searchEventCount,
    recentInquiries,
    recentSearchEvents,
    topSavedRaw,
  ] = await Promise.all([
    prisma.listing.count(),
    prisma.appUser.count(),
    prisma.savedListing.count(),
    prisma.inquiry.count(),
    prisma.searchEvent.count(),
    prisma.inquiry.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
        listing: {
          select: {
            title: true,
          },
        },
        user: {
          select: {
            email: true,
          },
        },
      },
    }),
    prisma.searchEvent.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
        clickedListing: {
          select: {
            title: true,
          },
        },
      },
    }),
    prisma.savedListing.groupBy({
      by: ["listingId"],
      _count: {
        listingId: true,
      },
      orderBy: {
        _count: {
          listingId: "desc",
        },
      },
      take: 5,
    }),
  ]);

  const topSavedIds = topSavedRaw.map((item) => item.listingId);
  const topSavedListings =
    topSavedIds.length > 0
      ? await prisma.listing.findMany({
          where: {
            id: {
              in: topSavedIds,
            },
          },
          select: {
            id: true,
            title: true,
            listingType: true,
            status: true,
          },
        })
      : [];

  const topSaved = topSavedRaw
    .map((entry) => {
      const listing = topSavedListings.find(
        (item) => item.id === entry.listingId,
      );
      if (!listing) {
        return null;
      }

      return {
        id: listing.id,
        title: listing.title,
        listingType: listing.listingType,
        status: listing.status,
        saves: entry._count.listingId,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const stats = [
    { label: "Listings", value: listingCount },
    { label: "Users", value: userCount },
    { label: "Saves", value: savedCount },
    { label: "Inquiries", value: inquiryCount },
    { label: "Search Events", value: searchEventCount },
  ];

  return (
    <div>
      <PageIntro
        eyebrow="Admin"
        title="Operations Dashboard"
        description="Monitor product signals, conversion intent, and recommendation inputs from live data."
      />

      <section className="section-padding pt-0">
        <div className="container-custom space-y-8">
          <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            {stats.map((stat) => (
              <article key={stat.label} className="card-soft rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-muted mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-semibold">
                  {stat.value.toLocaleString()}
                </p>
              </article>
            ))}
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <article className="card-soft rounded-2xl p-5">
              <h2 className="text-xl font-semibold mb-4">Recent Inquiries</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted border-b border-slate-200 dark:border-slate-700">
                      <th className="py-2 pr-3">Time</th>
                      <th className="py-2 pr-3">Listing</th>
                      <th className="py-2 pr-3">User</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInquiries.length === 0 ? (
                      <tr>
                        <td className="py-3 text-muted" colSpan={4}>
                          No inquiries yet.
                        </td>
                      </tr>
                    ) : (
                      recentInquiries.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-slate-100 dark:border-slate-800"
                        >
                          <td className="py-2 pr-3 whitespace-nowrap">
                            {formatDate(item.createdAt)}
                          </td>
                          <td className="py-2 pr-3">{item.listing.title}</td>
                          <td className="py-2 pr-3">
                            {item.user?.email ?? "Anonymous"}
                          </td>
                          <td className="py-2 capitalize">{item.status}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="card-soft rounded-2xl p-5">
              <h2 className="text-xl font-semibold mb-4">
                Recent Search Events
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted border-b border-slate-200 dark:border-slate-700">
                      <th className="py-2 pr-3">Time</th>
                      <th className="py-2 pr-3">Query</th>
                      <th className="py-2 pr-3">Clicked</th>
                      <th className="py-2">Results</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSearchEvents.length === 0 ? (
                      <tr>
                        <td className="py-3 text-muted" colSpan={4}>
                          No search events yet.
                        </td>
                      </tr>
                    ) : (
                      recentSearchEvents.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-slate-100 dark:border-slate-800"
                        >
                          <td className="py-2 pr-3 whitespace-nowrap">
                            {formatDate(item.createdAt)}
                          </td>
                          <td className="py-2 pr-3">{item.query}</td>
                          <td className="py-2 pr-3">
                            {item.clickedListing?.title ?? "-"}
                          </td>
                          <td className="py-2">{item.topResultIds.length}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </section>

          <section>
            <article className="card-soft rounded-2xl p-5">
              <h2 className="text-xl font-semibold mb-4">Top Saved Listings</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted border-b border-slate-200 dark:border-slate-700">
                      <th className="py-2 pr-3">Listing</th>
                      <th className="py-2 pr-3">Type</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2">Saves</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSaved.length === 0 ? (
                      <tr>
                        <td className="py-3 text-muted" colSpan={4}>
                          No saved-listing data yet.
                        </td>
                      </tr>
                    ) : (
                      topSaved.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-slate-100 dark:border-slate-800"
                        >
                          <td className="py-2 pr-3">{item.title}</td>
                          <td className="py-2 pr-3 capitalize">
                            {item.listingType}
                          </td>
                          <td className="py-2 pr-3 capitalize">
                            {item.status}
                          </td>
                          <td className="py-2">{item.saves}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        </div>
      </section>
    </div>
  );
}
