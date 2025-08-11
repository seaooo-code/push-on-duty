"use client";
import { alovaInstance } from "@/app/api";
import {
	CalendarDaysIcon,
	ClockIcon,
	DocumentIcon,
	UsersIcon,
} from "@heroicons/react/16/solid";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useRequest } from "alova/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

interface DashboardStats {
	activeDutiesCount: number;
	totalUsersCount: number;
	totalTemplatesCount: number;
	todayPushedCount: number;
}

export default function Home() {
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
		window.location.href = "/";
	});

	const { data } = useRequest(
		alovaInstance.Get<{
			data: DashboardStats;
		}>("/dashboard"),
	);

	useEffect(() => {
		const code = params.get("code");
		if (code) {
			send(code);
		}
	}, [send, params.get]);

	return (
		<div className="w-10/12 flex-1 p-4 space-y-6">
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<Card className="h-40">
					<CardHeader>
						<div className="w-full flex items-center justify-between">
							<span className="font-bold">活跃计划</span>
							<CalendarDaysIcon className="size-5" />
						</div>
					</CardHeader>
					<CardBody>
						<div className="font-bold text-2xl">
							{data?.data?.activeDutiesCount}
						</div>
						{/*<div className="text-sm text-gray-500 mt-4">+2 较上月</div>*/}
					</CardBody>
				</Card>
				<Card className="h-40">
					<CardHeader>
						<div className="w-full flex items-center justify-between">
							<span className="font-bold">值班人员</span>
							<UsersIcon className="size-5" />
						</div>
					</CardHeader>
					<CardBody>
						<div className="font-bold text-2xl">
							{data?.data?.totalUsersCount}
						</div>
						{/*<div className="text-sm text-gray-500 mt-4">+2 较上月</div>*/}
					</CardBody>
				</Card>
				<Card className="h-40">
					<CardHeader>
						<div className="w-full flex items-center justify-between">
							<span className="font-bold">通知模板</span>
							<DocumentIcon className="size-5" />
						</div>
					</CardHeader>
					<CardBody>
						<div className="font-bold text-2xl">
							{data?.data?.totalTemplatesCount}
						</div>
						{/*<div className="text-sm text-gray-500 mt-4">+2 较上月</div>*/}
					</CardBody>
				</Card>
				<Card className="h-40">
					<CardHeader>
						<div className="w-full flex items-center justify-between">
							<span className="font-bold">今日值班</span>
							<ClockIcon className="size-5" />
						</div>
					</CardHeader>
					<CardBody>
						<div className="font-bold text-2xl">
							{data?.data?.todayPushedCount}
						</div>
						{/*<div className="text-sm text-gray-500 mt-4">2个计划进行中</div>*/}
					</CardBody>
				</Card>
			</div>
			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<div className="flex flex-col gap-2">
							<div className="text-xl font-bold">快速操作</div>
							<div className="text-sm text-gray-500">常用功能快速入口</div>
						</div>
					</CardHeader>
					<CardBody>
						<Link
							href="/duty/create"
							className="group flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 hover:shadow-md border-0"
						>
							<div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors mr-4">
								<CalendarDaysIcon className="h-6 w-6 text-blue-600" />
							</div>
							<div className="flex-1">
								<div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
									创建值班计划
								</div>
								<div className="text-sm text-gray-500 mt-1">
									设置新的值班安排
								</div>
							</div>
						</Link>

						<Link
							href="/user"
							className="group flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 hover:shadow-md border-0"
						>
							<div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors mr-4">
								<UsersIcon className="h-6 w-6 text-green-600" />
							</div>
							<div className="flex-1">
								<div className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
									管理人员
								</div>
								<div className="text-sm text-gray-500 mt-1">
									添加或编辑值班人员
								</div>
							</div>
						</Link>

						<Link
							href="/template/create"
							className="group flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 transition-all duration-200 hover:shadow-md border-0"
						>
							<div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors mr-4">
								<DocumentIcon className="h-6 w-6 text-purple-600" />
							</div>
							<div className="flex-1">
								<div className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
									创建通知模板
								</div>
								<div className="text-sm text-gray-500 mt-1">
									设计通知消息模板
								</div>
							</div>
						</Link>
					</CardBody>
				</Card>
				<Card>
					<CardHeader>
						<div className="flex flex-col gap-2">
							<div className="text-xl font-bold">最近活动</div>
							<div className="text-sm text-gray-500">系统最新动态</div>
						</div>
					</CardHeader>
					<CardBody className="space-y-2">建设中......</CardBody>
				</Card>
			</div>
		</div>
	);
}
