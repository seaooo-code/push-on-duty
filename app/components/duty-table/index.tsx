"use client";
import { alovaInstance } from "@/app/api";
import type { DutyWithDetails } from "@/app/interface";
import { GlobalStore } from "@/app/store";
import {
	BellAlertIcon,
	BellSlashIcon,
	PlayIcon,
	TrashIcon,
} from "@heroicons/react/16/solid";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { User, addToast } from "@heroui/react";
import { EditIcon, SearchIcon } from "@heroui/shared-icons";
import { Spinner } from "@heroui/spinner";
import { accessAction, useRequest } from "alova/client";
import { clsx } from "clsx";
import Link from "next/link";
import { useSnapshot } from "valtio/react";

interface DutyTableProps {
	data: Array<DutyWithDetails>;
	loading: boolean;
}
function DutyTable({ data, loading }: DutyTableProps) {
	const snap = useSnapshot(GlobalStore);

	const { data: chats } = useRequest(
		alovaInstance.Get<{
			data: {
				items: {
					avatar: string;
					chat_id: string;
					name: string;
				}[];
			};
		}>("/feishu/chats"),
		{
			initialData: [],
		},
	);
	// 删除计划
	const { send: deleteDuty, loading: isDeleting } = useRequest(
		(id: number) =>
			alovaInstance.Delete(
				"/duties/delete",
				{
					id: id,
				},
				{
					name: "deleteDuty",
				},
			),
		{
			immediate: false,
		},
	).onSuccess(() => {
		accessAction("searchDuty", (delegatedActions) => {
			delegatedActions.send();
		});
		addToast({
			title: "删除计划成功",
			color: "success",
		});
	});
	// 手动执行计划
	const { send: runDuty, loading: isRunning } = useRequest(
		(id: number) =>
			alovaInstance.Post(
				"/duties/run",
				{ id },
				{
					name: "runDuty",
				},
			),
		{
			immediate: false,
		},
	).onSuccess(() => {
		accessAction("searchDuty", (delegatedActions) => {
			delegatedActions.send();
		});
		addToast({
			title: "手动执行计划成功",
			color: "success",
		});
	});
	// 修改计划状态
	const { send: switchStatus, loading: isSwitching } = useRequest(
		(id: number, enable: boolean, name: string) =>
			alovaInstance.Patch(
				"/duties/switch-status",
				{ id, status: enable ? 1 : 0 },
				{
					name: "switchDuty",
				},
			),
		{
			immediate: false,
		},
	).onSuccess((res) => {
		accessAction("searchDuty", (delegatedActions) => {
			delegatedActions.send();
		});
		addToast({
			title: `${res.args[1] ? "启用" : "禁用"}计划 ${res.args[2]}`,
			color: "success",
		});
	});
	return (
		<div>
			<div className="grid gap-4">
				{data.map((plan) => (
					<Card
						shadow="sm"
						key={plan.id}
						className={clsx(
							"border-l-4",
							plan.enabled ? "border-l-success" : "border-l-gray-400",
						)}
					>
						<CardHeader>
							<div className="w-full flex justify-between items-start">
								<div className="flex items-center gap-2">
									{plan.name}
									{plan.enabled ? (
										<Chip size="sm" color="success">
											已启用
										</Chip>
									) : (
										<Chip size="sm">已禁用</Chip>
									)}
								</div>
								<div className="flex gap-2">
									<Button
										variant="light"
										size="sm"
										isLoading={isRunning}
										isDisabled={!snap.isLogin}
										onPress={() => runDuty(plan.id)}
									>
										<PlayIcon className="h-4 w-4 mr-1" />
										立即执行
									</Button>
									<Button
										variant="light"
										size="sm"
										color={plan.enabled ? "danger" : "success"}
										isDisabled={!snap.isLogin}
										isLoading={isSwitching}
										onPress={() =>
											switchStatus(plan.id, !plan.enabled, plan.name)
										}
									>
										{plan.enabled ? (
											<>
												<BellSlashIcon className="h-4 w-4 mr-1" />
												禁用
											</>
										) : (
											<>
												<BellAlertIcon className="h-4 w-4 mr-1" />
												启用
											</>
										)}
									</Button>
									<Button
										as={Link}
										href={`/duty/${plan.id}`}
										variant="light"
										size="sm"
										isDisabled={!snap.isLogin}
										startContent={<EditIcon className="size-4" />}
									>
										编辑
									</Button>
									<Button
										variant="light"
										size="sm"
										color="danger"
										isLoading={isDeleting}
										isDisabled
										onPress={() => deleteDuty(plan.id)}
										startContent={<TrashIcon className="size-4" />}
									>
										删除
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardBody>
							<div className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
									<div>
										<div className="text-gray-500">通知群</div>
										<div className="font-medium">
											{chats.data?.items?.find(
												(item) => item.chat_id === plan.receiveId,
											)?.name || "-"}
										</div>
									</div>
									<div>
										<div className="text-gray-500">通知模板</div>
										<div className="font-medium">
											{plan.template?.name || "-"}
										</div>
									</div>
									<div>
										<div className="text-gray-500">值班周期</div>
										<div className="font-medium">每周轮换</div>
									</div>
									<div>
										<div className="text-gray-500">值班人员</div>
										<div className="font-medium">{plan.userCount || 0} 人</div>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
									<div>
										<div className="text-gray-500 text-sm mb-2">当前值班人</div>
										{plan.currentUser ? (
											<div className="flex items-center space-x-2">
												<User
													name={plan.currentUser.name}
													avatarProps={{ src: plan.currentUser.avatar }}
													description={plan.currentUser.email}
												/>
											</div>
										) : (
											<div className="text-sm text-gray-500">暂无值班人</div>
										)}
									</div>

									<div>
										<div className="text-gray-500 text-sm mb-2">上次运行</div>
										<div className="text-sm font-medium">
											{plan.lastRunTime || "从未运行"}
										</div>
									</div>

									{/*<div>*/}
									{/*	<div className="text-gray-500 text-sm mb-2">*/}
									{/*		下次运行*/}
									{/*	</div>*/}
									{/*	<div className="text-sm font-medium">*/}
									{/*		{plan.enabled && plan.nextRunTime*/}
									{/*			? plan.nextRunTime*/}
									{/*			: "已禁用"}*/}
									{/*	</div>*/}
									{/*</div>*/}
								</div>
							</div>
						</CardBody>
					</Card>
				))}
			</div>
			{data?.length === 0 && !loading ? (
				<div className="w-full flex flex-col items-center justify-center h-96">
					<SearchIcon className="size-8 mb-4" />
					<span className="font-bold">未找到相关结果</span>
				</div>
			) : null}
			{loading ? <Spinner /> : null}
		</div>
	);
}
export default DutyTable;
