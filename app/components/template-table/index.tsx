"use client";

import type { Template } from "@/app/interface";
import { GlobalStore } from "@/app/store";
import { TrashIcon } from "@heroicons/react/16/solid";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { EditIcon, SearchIcon } from "@heroui/shared-icons";
import { Spinner } from "@heroui/spinner";
import { clsx } from "clsx";
import Link from "next/link";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { useSnapshot } from "valtio/react";
import "react-photo-view/dist/react-photo-view.css";
import { alovaInstance } from "@/app/api";
import { addToast } from "@heroui/react";
import { useRequest } from "alova/client";

interface TemplateTableProps {
	data: Array<Template & { dutyCount: number }>;
	loading: boolean;
}
function TemplateTable({ data, loading }: TemplateTableProps) {
	const snap = useSnapshot(GlobalStore);

	const { send, loading: isDeleting } = useRequest(
		(userId: string) =>
			alovaInstance.Delete(`/templates/${userId}`, {
				name: "deleteTemplate",
			}),
		{
			immediate: false,
		},
	).onSuccess(() => {
		addToast({
			title: "删除模板成功",
			color: "success",
		});
	});

	return (
		<div>
			<div className="grid gap-4">
				{data.map((template) => (
					<Card
						key={template.id}
						className={clsx(
							"border-l-4",
							template.dutyCount > 0 ? "border-l-success" : "border-l-gray-400",
						)}
						shadow="sm"
					>
						<CardHeader>
							<div className="w-full flex justify-between items-start">
								<div className="flex items-center gap-2">{template.name}</div>
								<div className="flex gap-2">
									{/*<Button*/}
									{/*	variant="ghost"*/}
									{/*	size="sm"*/}
									{/*>*/}
									{/*	<DocumentDuplicateIcon className="h-4 w-4 mr-1" />*/}
									{/*	复制*/}
									{/*</Button>*/}
									<Button
										as={Link}
										href={`/template/${template.id}`}
										variant="light"
										size="sm"
										startContent={<EditIcon className="size-4" />}
										isDisabled={!snap.isLogin}
									>
										编辑
									</Button>
									<Button
										variant="light"
										size="sm"
										color="danger"
										isLoading={isDeleting}
										onPress={() => send(template.id)}
										isDisabled
										startContent={<TrashIcon className="size-4" />}
									>
										删除
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardBody>
							<div className="flex gap-4">
								<div className="flex-shrink-0">
									<div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
										{template.imageUrl ? (
											<PhotoProvider>
												<PhotoView src={template.imageUrl}>
													<img
														src={template.imageUrl}
														alt={`${template.name}示意图`}
														className="w-full h-full object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
													/>
												</PhotoView>
											</PhotoProvider>
										) : (
											<div className="text-center">
												<span className="text-xs text-gray-400">
													暂无示意图
												</span>
											</div>
										)}
									</div>
								</div>
								<div className="flex-1 space-y-3">
									<div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
										<div>
											<div className="text-gray-500">关联计划</div>
											<div className="font-medium">{template.dutyCount} 个</div>
										</div>
										<div>
											<div className="text-gray-500">使用次数</div>
											<div className="font-medium">-</div>
										</div>
										<div>
											<div className="text-gray-500">创建时间</div>
											<div className="font-medium">{template.createAt}</div>
										</div>
										<div>
											<div className="text-gray-500">更新时间</div>
											<div className="font-medium">{template.updateAt}</div>
										</div>
									</div>
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
export default TemplateTable;
