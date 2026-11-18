import { Redirect } from "expo-router";

import { HOME_ROUTE } from "@/lib/routes";

export default function Index() {
	return <Redirect href={HOME_ROUTE} />;
}
