import {
	CalendarXIcon,
	CarrotIcon,
	LeafIcon,
	type LucideIcon,
	MilkOffIcon,
	ShovelIcon,
	SproutIcon,
	WheatOffIcon,
} from "lucide-react";

export const tagIcons: Record<string, LucideIcon> = {
	Vegan: LeafIcon,
	Vegetarisch: CarrotIcon,
	Bio: SproutIcon,
	"Selbst angebaut": ShovelIcon,
	Glutenfrei: WheatOffIcon,
	Laktosefrei: MilkOffIcon,
	"MHD abgelaufen": CalendarXIcon,
};
