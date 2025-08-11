"use client";
import { alovaInstance } from "@/app/api";
import type { usersTable } from "@/drizzle/schema";
import {
	BuildingOfficeIcon,
	MapPinIcon,
	TagIcon,
	TrashIcon,
} from "@heroicons/react/16/solid";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { User, addToast } from "@heroui/react";
import { SearchIcon } from "@heroui/shared-icons";
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
	return (
		<div className="flex flex-wrap gap-4">
			{users?.map((staff) => (
				<Card key={staff.id} className="w-80" shadow="sm">
					<CardBody className="p-4">
						<div className="flex items-center group">
							<div className="flex flex-col items-start flex-1">
								<User
									name={staff.name}
									avatarProps={{ src: staff.avatar }}
									description={
										<>
											<div>{staff.email}</div>
											<div className="flex items-center gap-4 text-xs text-muted-foreground my-1">
												<div className="flex items-center gap-1">
													<BuildingOfficeIcon className="h-3 w-3" />
													<span>{staff.departmentName}</span>
												</div>
												<div className="flex items-center gap-1">
													<MapPinIcon className="h-3 w-3" />
													<span>{staff.city}</span>
												</div>
											</div>
											{staff.description ? (
												<div className="flex items-center gap-1">
													<TagIcon className="h-3 w-3" />
													<span className="w-40 truncate">
														{staff.description}
													</span>
												</div>
											) : null}
										</>
									}
								/>
							</div>
							<Button
								className="self-baseline hidden group-hover:block"
								color="danger"
								variant="light"
								size="sm"
								isIconOnly
								isDisabled
								isLoading={isDeleting}
								onPress={() => send(staff.id)}
								startContent={<TrashIcon className="size-4" />}
							/>
						</div>
					</CardBody>
				</Card>
			))}
			{users?.length === 0 && !loading ? (
				<div className="w-full flex flex-col items-center justify-center h-96">
					<SearchIcon className="size-8 mb-4" />
					<span className="font-bold">未找到相关结果</span>
				</div>
			) : null}
			{loading ? <Spinner /> : null}
		</div>
	);
}
export default UserTable;
