"use client";
import { proxy } from "valtio";

type Props = {
	isLogin: boolean;
	loginUser?: {
		id: string;
		name: string;
		avatarUrl: string;
		email: string;
	};
};

export const GlobalStore = proxy<Props>({
	isLogin: false,
});
