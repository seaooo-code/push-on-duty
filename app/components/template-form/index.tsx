"use client";

import { alovaInstance } from "@/app/api";
import {
	ControllerInput,
	ControllerSelect,
} from "@/app/components/react-hook-form";
import type { Template } from "@/app/interface";
import { GlobalStore } from "@/app/store";
import type { templatesTable } from "@/drizzle/schema";
import { MinusIcon, PlusIcon } from "@heroicons/react/16/solid";
import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { addToast } from "@heroui/react";
import { SelectItem } from "@heroui/select";
import { useRequest } from "alova/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { useSnapshot } from "valtio/react";

type Var = {
	key: string;
	value: Set<string>;
};
type FormValues = {
	id: string;
	name: string;
	vars: Var[];
	imageUrl: string;
};
type TemplateInsert = typeof templatesTable.$inferInsert;

const SelectOptions = [
	{
		key: "date",
		label: "当前值班日期",
	},
	{
		key: "nextDate",
		label: "下次值班日期",
	},
	{
		key: "currentUserId",
		label: "当前值班用户 ID",
	},
	{
		key: "nextUserId",
		label: "下次值班用户 ID",
	},
	{
		key: "atCurrentUser",
		label: "@ 当前值班用户",
	},
	{
		key: "atNextUser",
		label: "@ 下次值班用户",
	},
	{
		key: "dayOfWeek",
		label: "值班当天星期",
	},
];

interface TemplateFormProps {
	template?: Template;
}

const TemplateForm = ({ template }: TemplateFormProps) => {
	const snap = useSnapshot(GlobalStore);
	const router = useRouter();
	const { handleSubmit, control, watch, reset } = useForm<FormValues>({
		defaultValues: {
			id: template?.id,
			name: template?.name,
			imageUrl: template?.imageUrl,
			vars: template?.vars
				? Object.entries(template.vars)?.map(([key, value]) => {
						return {
							key,
							value: new Set([value]),
						};
					})
				: [],
		},
	});
	const { fields, append, remove } = useFieldArray({ control, name: "vars" });

	const { send: create, loading: isCreating } = useRequest(
		(data: TemplateInsert) =>
			alovaInstance.Post("/templates/create", data, { name: "createTemplate" }),
		{
			immediate: false,
		},
	).onSuccess(() => {
		addToast({
			title: "创建模板成功",
			color: "success",
		});
		router.push("/template");
	});

	const { send: update, loading: isUpdating } = useRequest(
		(data: TemplateInsert) =>
			alovaInstance.Put("/templates/update", data, { name: "updateTemplate" }),
		{
			immediate: false,
		},
	).onSuccess(() => {
		addToast({
			title: "更新模板成功",
			color: "success",
		});
		router.push("/template");
	});

	const onSubmit = (data: FormValues) => {
		if (!snap.loginUser?.id) {
			addToast({
				title: "请登录再重试",
				color: "danger",
			});
			return;
		}
		const vars: Record<string, string> = {};
		for (const item of data.vars) {
			vars[item.key] = Array.from(item.value)[0];
		}
		const values = {
			...data,
			vars,
		};
		if (template) {
			update(values);
		} else {
			create(values);
		}
	};
	return (
		<div className="w-full flex-1 h-0 overflow-auto flex justify-center">
			<Form
				className="w-2/4 gap-4 items-stretch"
				onSubmit={handleSubmit(onSubmit)}
			>
				<ControllerInput
					controller={{
						name: "name",
						control: control,
						rules: { required: "必填字段" },
					}}
					input={{
						placeholder: "请输入",
						label: "模板名称",
						labelPlacement: "outside",
					}}
				/>
				<ControllerInput
					controller={{
						name: "id",
						control: control,
						rules: { required: "必填字段" },
					}}
					input={{
						placeholder: "请输入",
						label: (
							<div>
								飞书卡片 ID
								<span className="text-xs ml-1 text-gray-500">
									请先
									<Link
										className="underline"
										href="https://open.f.mioffice.cn/cardkit"
										target="_blank"
									>
										搭建飞书卡片
									</Link>
									，发布后添加应用【值班推送】
								</span>
							</div>
						),
						labelPlacement: "outside",
					}}
				/>
				<ControllerInput
					controller={{
						name: "imageUrl",
						control: control,
						rules: { required: "必填字段" },
					}}
					input={{
						placeholder: "请输入",
						label: "示意图链接",
						labelPlacement: "outside",
					}}
				/>
				<div className="text-sm">变量映射</div>
				{fields.map((field, idx) => {
					return (
						<div className="flex items-center gap-1" key={field.id}>
							<ControllerInput
								controller={{
									name: `vars.${idx}.key`,
									control: control,
									rules: { required: "必填字段" },
								}}
								input={{
									placeholder: "请输入",
									label: `第${idx + 1}个飞书卡片变量`,
									size: "sm",
								}}
							/>
							<ControllerSelect
								controller={{
									name: `vars.${idx}.value`,
									control: control,
									rules: {
										required: "必填字段",
										validate: (value: Set<string>) => {
											return (value && value.size > 0) || "请选择系统变量";
										},
									},
								}}
								select={{
									placeholder: "请选择",
									label: `第${idx + 1}个系统变量`,
									size: "sm",
									children: SelectOptions.map((item) => (
										<SelectItem key={item.key}>{item.label}</SelectItem>
									)),
								}}
							/>

							<Button
								color="danger"
								onPress={() => remove(idx)}
								isIconOnly
								variant="light"
								startContent={<MinusIcon className="size-4" />}
							/>
						</div>
					);
				})}
				<Button
					variant="ghost"
					onPress={() => append({ key: "", value: new Set() })}
					startContent={<PlusIcon className="size-4" />}
					className="flex-shrink-0"
				>
					添加一行
				</Button>
				<div className="flex items-center gap-2">
					<Button
						type="submit"
						color="primary"
						variant="solid"
						isLoading={isCreating || isUpdating}
					>
						提交
					</Button>
					<Button
						type="reset"
						variant="bordered"
						color="secondary"
						onPress={() => reset()}
					>
						重置
					</Button>
				</div>
			</Form>
		</div>
	);
};
export default TemplateForm;
