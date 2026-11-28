import { formatDay } from "@food-swap/shared/endDate";
import { formatPlace } from "@food-swap/shared/places";
import type { ListingFormValues } from "@food-swap/shared/schemas/listing";
import type { Category, Place, Tag } from "@food-swap/shared/types";
import { Image } from "expo-image";
import { useState } from "react";
import { View } from "react-native";

import { ListingImagePlaceholder } from "@/components/ListingImagePlaceholder";
import { Text } from "@/components/ui/text";
import { LISTING_TYPE_LABELS } from "@/lib/listing";

type Props = {
	values: ListingFormValues;
	place: Place | null;
	categories: Category[];
	tags: Tag[];
};

function Row({ label, value }: { label: string; value: string }) {
	return (
		<View className="gap-1">
			<Text variant="muted">{label}</Text>
			<Text>{value}</Text>
		</View>
	);
}

function PreviewImage({ uri }: { uri: string }) {
	const [failed, setFailed] = useState(false);

	return (
		<View className="realtive aspect-video overflow-hidden rounded-md bg-muted">
			{failed ? (
				<ListingImagePlaceholder />
			) : (
				<Image
					source={{ uri }}
					contentFit="cover"
					style={{ width: "100%", height: "100%" }}
					onError={() => setFailed(true)}
				/>
			)}
		</View>
	);
}

export function ListingPreview({ values, place, categories, tags }: Props) {
	const category = categories.find((item) => item.id === values.categoryId);
	const tagNames = tags
		.filter((tag) => values.tagIds.includes(tag.id))
		.map((tag) => tag.name)
		.join(", ");

	return (
		<View className="gap-4 border-t border-border pt-4">
			<Text variant="h3">Dein Angebot</Text>
			{values.image ? <PreviewImage key={values.image} uri={values.image} /> : null}
			<Row label="Titel" value={values.title} />
			<Row label="Beschreibung" value={values.description} />
			<Row label="Art" value={LISTING_TYPE_LABELS[values.type]} />
			{category ? <Row label="Kategorie" value={category.name} /> : null}
			{tagNames ? <Row label="Tags" value={tagNames} /> : null}
			{place ? <Row label="Ort" value={formatPlace(place)} /> : null}
			{values.endDate ? (
				<Row label="Verfügbar bis" value={formatDay(values.endDate)} />
			) : null}
		</View>
	);
}
