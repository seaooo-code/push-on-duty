"use client";
import { alovaInstance } from "@/app/api";
import TemplateTable from "@/app/components/template-table";
import type { Template } from "@/app/interface";
import { GlobalStore } from "@/app/store";
import { PlusIcon } from "@heroicons/react/16/solid";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { SearchIcon } from "@heroui/shared-icons";
import { useRequest } from "alova/client";
import Link from "next/link";
import { useSnapshot } from "valtio/react";

function TemplatePage() {
	const snap = useSnapshot(GlobalStore);
	const { data, loading } = useRequest(
		alovaInstance.Get<{
			templates: Array<Template & { dutyCount: number }>;
		}>("/templates/search", {
			hitSource: ["createTemplate", "updateTemplate", "deleteTemplate"],
		}),
		{
			initialData: {
				templates: [],
			},
		},
	);
	return (
		<div className="flex-1 h-0 overflow-hidden w-10/12 flex flex-col gap-4">
			<div className="flex justify-between">
				<Input
					placeholder="搜索"
					startContent={<SearchIcon />}
					className="w-80"
					isDisabled
				/>
				<Button
					as={Link}
					color="primary"
					href="/template/create"
					variant="solid"
					isDisabled={!snap.isLogin}
				>
					<PlusIcon />
					新建
				</Button>
			</div>
			<div className="flex-1 h-0 overflow-auto pl-1 pr-4 py-4">
				<TemplateTable data={data.templates || []} loading={loading} />
			</div>
		</div>
	);
}
export default TemplatePage;
