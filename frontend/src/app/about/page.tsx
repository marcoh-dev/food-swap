import { pageTitles } from "@/lib/constants/titles.constants";
import type { Metadata } from "next";

export const metadata: Metadata = { title: pageTitles.about };

export default function About() {
	return <h2>We are Food Swap</h2>;
}
