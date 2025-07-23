import { GlobalStore } from "@/app/store";
import { createAlova } from "alova";
import { createClientTokenAuthentication } from "alova/client";
import adapterFetch from "alova/fetch";
import ReactHook from "alova/react";

type IRefreshTokenRes = {
	success: boolean;
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

const BASE_URL =
	process.env.NODE_ENV === "production"
		? "https://task-api.be.xiaomiev.com"
		: "http://localhost:3001";

export const refreshToken = () => {
	const method = alovaInstance.Get<IRefreshTokenRes>("/feishu/refresh-token");
	method.meta = {
		authRole: "refreshToken",
	};
	return method;
};

const { onAuthRequired, onResponseRefreshToken } =
	createClientTokenAuthentication({
		refreshToken: {
			// 在请求前触发，将接收到method参数，并返回boolean表示token是否过期
			isExpired: (method) => {
				return Number(localStorage.getItem("expires_in")) > Date.now();
			},

			// 当token过期时触发，在此函数中触发刷新token
			handler: async (method) => {
				try {
					const { data } = await refreshToken();
					localStorage.setItem("access_token", data?.access_token);
					localStorage.setItem("refresh_token", data?.refresh_token);
					localStorage.setItem(
						"expires_in",
						String(data?.expires_in + Date.now()),
					);
					localStorage.setItem(
						"refresh_expires_in",
						String(data?.refresh_expires_in + Date.now()),
					);
				} catch (error) {
					// token刷新失败，跳转回登录页
					localStorage.clear();
					GlobalStore.isLogin = false;
					location.href = "/";
					// 并抛出错误
					throw error;
				}
			},
		},
	});

export const alovaInstance = createAlova({
	baseURL: BASE_URL,
	requestAdapter: adapterFetch(),
	statesHook: ReactHook,
	beforeRequest: onAuthRequired((method) => {
		method.config.headers.token = localStorage.getItem("access_token");
		method.config.headers.refresh_token = localStorage.getItem("refresh_token");
	}),
	responded: (response) => response.json(),
});
