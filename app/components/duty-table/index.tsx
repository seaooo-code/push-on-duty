"use client";
import { alovaInstance } from "@/app/api";
import type { DutyWithCurrentUser } from "@/app/interface";
import { GlobalStore } from "@/app/store";
import { PlayIcon } from "@heroicons/react/16/solid";
import { Button } from "@heroui/button";
import {
	Switch,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Tooltip,
	User,
	addToast,
} from "@heroui/react";
import { DeleteIcon, EditIcon } from "@heroui/shared-icons";
import { Spinner } from "@heroui/spinner";
import { accessAction, useRequest } from "alova/client";
import { useRouter } from "next/navigation";
import { useSnapshot } from "valtio/react";

interface DutyTableProps {
	data: Array<DutyWithCurrentUser>;
	loading: boolean;
}
function DutyTable({ data, loading }: DutyTableProps) {
	const snap = useSnapshot(GlobalStore);
	const router = useRouter();
	// 删除计划
	const { send, loading: isDeleting } = useRequest(
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
		<Table>
			<TableHeader>
				<TableColumn>名称</TableColumn>
				<TableColumn>是否启用</TableColumn>
				<TableColumn>当前值班</TableColumn>
				<TableColumn>定时任务</TableColumn>
				<TableColumn>上次运行时间</TableColumn>
				<TableColumn>创建时间</TableColumn>
				<TableColumn>操作</TableColumn>
			</TableHeader>
			<TableBody
				loadingState={loading ? "loading" : "idle"}
				loadingContent={<Spinner />}
			>
				{data.map((element) => (
					<TableRow key={element.name}>
						<TableCell>
							<div className="truncate max-w-30">{element.name}</div>
						</TableCell>
						<TableCell>
							<Switch
								isSelected={element.enabled === 1}
								size="sm"
								onValueChange={() =>
									switchStatus(element.id, !element.enabled, element.name)
								}
							/>
						</TableCell>
						<TableCell>
							<User
								avatarProps={{
									src: element.currentUser?.avatar,
								}}
								name={element.currentUser?.name}
							/>
						</TableCell>
						<TableCell>{element.cronSchedule}</TableCell>
						<TableCell>{element.lastRunTime || "从未运行过"}</TableCell>
						<TableCell>{element.createAt}</TableCell>
						<TableCell>
							<div className="flex items-center gap-1">
								<Tooltip content="手动运行">
									<Button
										isIconOnly
										variant="light"
										size="sm"
										onPress={() => runDuty(element.id)}
										color="primary"
										isLoading={isRunning}
									>
										<PlayIcon className="size-4" />
									</Button>
								</Tooltip>
								<Button
									isIconOnly
									variant="light"
									size="sm"
									onPress={() => router.push(`duty/${element.id}`)}
								>
									<EditIcon />
								</Button>
								<Button
									isIconOnly
									variant="light"
									size="sm"
									onPress={() => send(element.id)}
									color="danger"
									isDisabled={snap.loginUser?.id !== element.creatorId}
									isLoading={isDeleting}
								>
									<DeleteIcon />
								</Button>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
export default DutyTable;
