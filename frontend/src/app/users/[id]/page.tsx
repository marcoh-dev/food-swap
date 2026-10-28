import { SortingMenu } from "@/components/listing/SortingMenu";
import { UserDelete } from "@/components/user/UserDelete";
import { UserUpdate } from "@/components/user/UserUpdate";
import { NotificationSetting } from "@/components/user/NotificationSetting";
import { pageTitles } from "@/lib/constants/titles.constants";
import { getCurrentUser, getUserById } from "@/lib/users.service";
import { formatDate, isExpired } from "@/utils/date";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import ListingsPagination from "@/components/listing/ListingsPagination";
import type { SortOption } from "@/lib/types/listing.types";
import { getUserListings } from "@/lib/listings.service";
import { parsePage } from "@/utils/pagination";
import { getCategories } from "@/lib/categories.service";
import { getTags } from "@/lib/tags.service";
import { formatPlace } from "@/utils/place";
import { PencilIcon } from "lucide-react";
import { FieldDescription } from "@/components/ui/field";
import ListingCard from "@/components/listing/ListingCard";
import ListingActions from "@/components/listing/ListingAction";
import ViewMenu from "@/components/listing/ViewMenu";
import { ProfileEditCollapsible } from "@/components/user/ProfileEditCollapsible";

export const metadata: Metadata = { title: pageTitles.myProfile };

export default async function UserPage({ params, searchParams }: PageProps<"/users/[id]">) {
	const { id: userId } = await params;
	const query = await searchParams;

	const user = await getUserById(userId);
	if (!user) notFound();

	const currentUser = await getCurrentUser();
	const isOwner = currentUser?.id === userId;

	const page = parsePage(query.page);
	const sort: SortOption = query.sort === "endingSoon" ? "endingSoon" : "newest";

	const view = query.view === "list" ? "list" : "grid";
	const categories = await getCategories();
	const tags = await getTags();

	const listingsData = await getUserListings({ userId, page, sort });

	if (!listingsData) {
		notFound();
	}

	const { totalPages } = listingsData.meta;
	if (totalPages > 0 && page > totalPages) {
		redirect(`/users/${userId}?page=${totalPages}&sort=${sort}&view=${view}`);
	}

	return (
		<>
			<section aria-label="Profil" className="rounded-xl border bg-card p-4">
				<ProfileEditCollapsible>
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0">
							<p className="text-2xl wrap-break-word">{user.name ?? user.username}</p>
							{!user.name && (
								<FieldDescription>Kein Profilname vergeben.</FieldDescription>
							)}
						</div>
						{isOwner && (
							<CollapsibleTrigger asChild>
								<Button variant="outline" className="shrink-0">
									<PencilIcon aria-hidden="true" />
									<span className="sr-only">Profil bearbeiten</span>
								</Button>
							</CollapsibleTrigger>
						)}
					</div>

					<dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
						{isOwner && (
							<>
								<dt className="text-muted-foreground">Benutzername:</dt>
								<dd className="text-foreground">{user.username}</dd>

								<dt className="text-muted-foreground">Standort:</dt>
								<dd className="text-foreground">
									{currentUser.place
										? formatPlace(currentUser.place)
										: "Kein Ort gewählt."}
								</dd>
							</>
						)}

						<dt className="text-muted-foreground">Registriert seit:</dt>
						<dd className="text-foreground">{formatDate(user.createdAt)}</dd>
					</dl>

					{isOwner && (
						<CollapsibleContent className="mt-4 flex flex-col gap-4 border-t pt-4">
							<UserUpdate
								currentName={user.name ?? undefined}
								currentPlace={currentUser.place}
							/>
							<div className="border-t pt-4">
								<NotificationSetting />
							</div>
							<div className="flex items-center justify-between gap-4 border-t pt-4">
								<p className="text-sm text-muted-foreground">FoodSwap verlassen?</p>
								<UserDelete />
							</div>
						</CollapsibleContent>
					)}
				</ProfileEditCollapsible>
			</section>

			<>
				<h3 className="text-h3 mt-10">
					{isOwner ? "Meine Anzeigen" : `Anzeigen von ${user.name ?? user.username}`}
				</h3>
				{listingsData.data.length === 0 ? (
					<p className="py-12 text-center text-gray-500">
						Dieser User hat aktuell keine Anzeigen.
					</p>
				) : (
					<>
						<div className="flex justify-end items-center gap-2 mb-2">
							<ViewMenu view={view} />
							<SortingMenu sort={sort} />
						</div>
						<ul
							className={
								view === "list"
									? "grid auto-rows-fr gap-3 max-sm:mx-[-1em]"
									: "grid grid-cols-2 gap-3 max-sm:mx-[-1em] max-sm:*:odd:*:rounded-l-none max-sm:*:even:*:rounded-r-none sm:gap-8 md:gap-12"
							}
						>
							{listingsData.data.map((listing) => (
								<li key={listing.id}>
									<ListingCard
										listing={listing}
										variant={view}
										showExpired={isOwner}
										unavailable={
											isOwner &&
											(listing.status === "deactivated" ||
												isExpired(listing.endDate))
										}
										actions={
											isOwner && (
												<ListingActions
													listing={listing}
													categories={categories}
													tags={tags}
													isEditingInList
												/>
											)
										}
									/>
								</li>
							))}
						</ul>
						<ListingsPagination
							page={listingsData.meta.page}
							totalPages={totalPages}
							searchParams={{ sort, view }}
						/>
					</>
				)}
			</>
		</>
	);
}
