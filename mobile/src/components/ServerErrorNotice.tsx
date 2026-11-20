import type { ReactNode } from "react";

import { Notice } from "@/components/Notice";

type Props = {
	message: string;
	children?: ReactNode;
};

export function ServerErrorNotice({ message, children }: Props) {
	return (
		<Notice
			icon={{ ios: "exclamationmark.circle", android: "error" }}
			variant="destructive"
			title="Food Swap ist gerade nicht erreichbar"
			message={message}
		>
			{children}
		</Notice>
	);
}
