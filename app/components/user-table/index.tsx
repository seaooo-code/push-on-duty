"use client";
import { alovaInstance } from "@/app/api";
import type { usersTable } from "@/drizzle/schema";
import { Button } from "@heroui/button";
import {
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
import { DeleteIcon } from "@heroui/shared-icons";
import { Spinner } from "@heroui/spinner";
import { accessAction, useRequest } from "alova/client";

interface UserTableProps {
	users: (typeof usersTable.$inferSelect)[];
	loading: boolean;
}
function UserTable({ users, loading }: UserTableProps) {
	const { send, loading: isDeleting } = useRequest(
		(userId: string) =>
			alovaInstance.Delete(
				"/users/delete",
				{
					userId,
				},
				{
					name: "deleteUser",
				},
			),
		{
			immediate: false,
		},
	).onSuccess(() => {
		accessAction("searchUser", (delegatedActions) => {
			delegatedActions.send();
		});
		addToast({
			title: "删除人员成功",
			color: "success",
		});
	});
	const rows =
		users?.map?.((element) => (
			<TableRow key={element.name}>
				<TableCell>
					<User
						name={element.name}
						avatarProps={{ src: element.avatar }}
						description={element.email}
					/>
				</TableCell>
				<TableCell>{element.createAt}</TableCell>
				<TableCell>{element.updateAt}</TableCell>
				<TableCell>
					<Tooltip content="删除人员" color="danger">
						<Button
							isLoading={isDeleting}
							isIconOnly
							size="sm"
							variant="light"
							onPress={() => send(element.id)}
							isDisabled={true}
						>
							<DeleteIcon color="red" />
						</Button>
					</Tooltip>
				</TableCell>
			</TableRow>
		)) || [];
	return (
		<Table isVirtualized>
			<TableHeader>
				<TableColumn>姓名</TableColumn>
				<TableColumn>创建时间</TableColumn>
				<TableColumn>更新时间</TableColumn>
				<TableColumn>操作</TableColumn>
			</TableHeader>
			<TableBody
				loadingContent={<Spinner />}
				loadingState={loading ? "loading" : "idle"}
			>
				{rows}
			</TableBody>
		</Table>
	);
}
export default UserTable;
