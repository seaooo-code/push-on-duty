"use client";

import { alovaInstance } from "@/app/api";
import { GlobalStore } from "@/app/store";
import { useRequest } from "alova/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

type IUserAccessToken = {
	code: number;
	data: {
		access_token: string;
		refresh_token: string;
		token_type: string;
		expires_in: number;
		refresh_expires_in: number;
		scope: string;
	};
	message: string;
};

export default function Home() {
	const router = useRouter();
	const params = useSearchParams();

	const { send } = useRequest(
		(code: string) =>
			alovaInstance.Get<IUserAccessToken>(
				`/feishu/user-access-token?code=${code}`,
			),
		{
			immediate: false,
		},
	).onSuccess((res) => {
		localStorage.setItem("access_token", res.data?.data?.access_token);
		localStorage.setItem("refresh_token", res.data?.data?.refresh_token);
		localStorage.setItem(
			"expires_in",
			String(res.data?.data?.expires_in + Date.now()),
		);
		localStorage.setItem(
			"refresh_expires_in",
			String(res.data.data.refresh_expires_in + Date.now()),
		);
		GlobalStore.isLogin = true;
		window.location.href = "/";
	});

	useEffect(() => {
		const code = params.get("code");
		if (code) {
			send(code);
		}
	}, [send, params.get]);

	return (
		<div className="flex-1 flex items-center justify-center">
			飞书机器人-值班推送
		</div>
	);
}
