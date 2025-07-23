"use client";
import { alovaInstance } from "@/app/api";
import { CustomRadio } from "@/app/components/custom-radio";
import {
	ControllerCronInput,
	ControllerInput,
	ControllerRadioGroup,
	ControllerSelect,
	ControllerTimeInput,
} from "@/app/components/react-hook-form";
import UserCardList from "@/app/components/user-card-list";
import type {
	DutyInsert,
	DutyWithUsers,
	User as IUser,
	Template,
} from "@/app/interface";
import { GlobalStore } from "@/app/store";
import { calculateEndDateTime } from "@/app/utils";
import {
	CalendarDaysIcon,
	ClockIcon,
	InformationCircleIcon,
} from "@heroicons/react/16/solid";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { Tooltip, User, addToast } from "@heroui/react";
import { SelectItem } from "@heroui/select";
import { Time } from "@internationalized/date";
import type { TimeValue } from "@react-types/datepicker";
import type { Key } from "@react-types/shared";
import { useRequest, useWatcher } from "alova/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSnapshot } from "valtio/react";

type FormValues = {
	name: string;
	users: Set<string>;
	enable: string;
	receiveId: Set<string>;
	templateId: Set<string>;
	cronSchedule: string;
	dayOfWeek: Set<string>;
	startDayTime: TimeValue;
};

const DayWeekItems = [
	{
		key: 1,
		name: "星期一",
	},
	{
		key: 2,
		name: "星期二",
	},
	{
		key: 3,
		name: "星期三",
	},
	{
		key: 4,
		name: "星期四",
	},
	{
		key: 5,
		name: "星期五",
	},
	{
		key: 6,
		name: "星期六",
	},
	{
		key: 7,
		name: "星期日",
	},
];

interface DutyFormProps {
	duty?: DutyWithUsers;
}
export default function DutyForm({ duty }: DutyFormProps) {
	const snap = useSnapshot(GlobalStore);
	const router = useRouter();
	const [searchInput, setSearchInput] = useState("");
	const [selectedUsers, setSelectedUsers] = useState<IUser[]>(
		duty?.users || [],
	);
	const { handleSubmit, control, watch, reset } = useForm<FormValues>({
		defaultValues: {
			name: duty?.name,
			enable: duty?.enabled ? String(duty.enabled) : "0",
			cronSchedule: duty?.cronSchedule,
			receiveId: duty?.receiveId ? new Set([duty.receiveId]) : undefined,
			templateId: duty?.templateId ? new Set([duty.templateId]) : undefined,
			dayOfWeek: duty ? new Set([String(duty.dayOfWeek)]) : undefined,
			startDayTime: duty
				? new Time(duty.startTimeHour, duty.startTimeMinute)
				: undefined,
		},
	});
	const dayOfWeek = watch("dayOfWeek");
	const startDayTime = watch("startDayTime");
	const { data: templateRes } = useRequest(
		alovaInstance.Get<{
			templates: Template[];
		}>("/templates/search"),
		{
			initialData: {
				templates: [],
			},
		},
	);
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
	const { data: searchUsers, loading: isSearching } = useWatcher(
		alovaInstance.Get<{
			users: IUser[];
		}>(`/users/search?keyword=${searchInput}`),
		[searchInput],
		{
			immediate: true,
			initialData: [],
			debounce: 500,
		},
	);

	const { send: create, loading: isCreating } = useRequest(
		(data: DutyInsert & { users: string[] }) =>
			alovaInstance.Post("/duties/create", data, { name: "createDuty" }),
		{
			immediate: false,
		},
	).onSuccess(() => {
		addToast({
			title: "创建计划成功",
			color: "success",
		});
		router.push("/duty");
	});

	const { send: update, loading: isUpdating } = useRequest(
		(data: DutyInsert & { users: string[] }) =>
			alovaInstance.Put("/duties/update", data, { name: "updateDuty" }),
		{
			immediate: false,
		},
	).onSuccess(() => {
		addToast({
			title: "更新计划成功",
			color: "success",
		});
		router.push("/duty");
	});

	const onSubmit = (data: FormValues) => {
		if (!snap.loginUser?.id) {
			addToast({
				title: "请登录再重试",
				color: "danger",
			});
			return;
		}
		if (selectedUsers.length === 0) {
			addToast({
				title: "请至少添加一位值班人员",
				color: "danger",
			});
			return;
		}
		const values = {
			id: duty?.id,
			name: data.name,
			enabled: Number(data.enable),
			personIndex: duty?.personIndex || 0,
			cronSchedule: data.cronSchedule,
			receiveId: Array.from(data.receiveId)[0],
			templateId: Array.from(data.templateId)[0],
			dayOfWeek: Number(Array.from(data.dayOfWeek)[0]),
			startTimeHour: data.startDayTime.hour,
			startTimeMinute: data.startDayTime.minute,
			endTimeHour: calculateEndDateTime(dayOfWeek, data.startDayTime).row
				.endHour,
			endTimeMinute: calculateEndDateTime(dayOfWeek, data.startDayTime).row
				.endMinute,
			users: selectedUsers?.map((item) => item.id) || [],
			creatorId: snap.loginUser.id,
		};
		if (duty) {
			update(values);
		} else {
			create(values);
		}
	};
	const handleUserSelectChange = (key: Key | null) => {
		const flag = selectedUsers.find((item) => item.id === key);
		if (!flag) {
			const user = searchUsers.users?.find((item) => item.id === key);
			user && setSelectedUsers([...selectedUsers, user]);
		}
	};
	return (
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
					label: "名称",
					labelPlacement: "outside",
				}}
			/>
			<ControllerRadioGroup
				controller={{
					name: "enable",
					control: control,
					rules: { required: "必填字段" },
				}}
				radioGroup={{
					label: <span className="text-sm text-black">启用</span>,
					orientation: "horizontal",
					children: (
						<>
							<CustomRadio value="1">是</CustomRadio>
							<CustomRadio value="0">否</CustomRadio>
						</>
					),
				}}
			/>
			<ControllerSelect
				controller={{
					name: "receiveId",
					control: control,
					rules: { required: "必填字段" },
				}}
				select={{
					className: "flex-1",
					placeholder: "请选择",
					label: (
						<div className="flex items-center">
							通知群
							<Tooltip content="请先将值班推送机器人拉到需要通知的飞书群中">
								<InformationCircleIcon className="size-4 ml-1" />
							</Tooltip>
						</div>
					),
					labelPlacement: "outside",
					children: (
						<>
							{chats?.data?.items?.map?.((item) => (
								<SelectItem key={item.chat_id} textValue={item.name}>
									<User
										name={item.name}
										avatarProps={{ src: item.avatar, size: "sm" }}
									/>
								</SelectItem>
							))}
						</>
					),
				}}
			/>
			<ControllerSelect
				controller={{
					name: "templateId",
					control: control,
					rules: { required: "必填字段" },
				}}
				select={{
					className: "flex-1",
					placeholder: "请选择",
					label: "通知模板",
					labelPlacement: "outside",
					children: (
						<>
							{templateRes?.templates?.map((item) => (
								<SelectItem key={item.id}>{item.name}</SelectItem>
							))}
						</>
					),
				}}
			/>
			<div>
				<div className="text-small text-black mb-2">定时任务</div>
				<ControllerCronInput
					controller={{
						name: "cronSchedule",
						control: control,
						rules: { required: "必填字段" },
					}}
					cronInput={{}}
				/>
			</div>
			<span className="text-small">值班周期</span>
			<div className="flex items-center gap-1">
				<span className="text-small text-gray-500">本周：</span>
				<ControllerSelect
					controller={{
						name: "dayOfWeek",
						control: control,
						rules: { required: "必填字段" },
					}}
					select={{
						className: "w-28",
						size: "sm",
						placeholder: "请选择",
						labelPlacement: "outside",
						startContent: <CalendarDaysIcon className="size-5" />,
						children: (
							<>
								{DayWeekItems.map((item) => (
									<SelectItem key={item.key}>{item.name}</SelectItem>
								))}
							</>
						),
					}}
				/>
				<ControllerTimeInput
					controller={{
						name: "startDayTime",
						control: control,
						rules: { required: "必填字段" },
					}}
					timeInput={{
						className: "w-22",
						size: "sm",
						granularity: "minute",
						hourCycle: 24,
						hideTimeZone: true,
						startContent: <ClockIcon className="size-5" />,
					}}
				/>
				~
				<span className="text-small text-gray-500">
					下周：
					{dayOfWeek && startDayTime
						? calculateEndDateTime(dayOfWeek, startDayTime).formated
						: "****"}
				</span>
			</div>
			<Autocomplete
				labelPlacement="outside"
				label={
					<div className="flex items-center">
						值班人员
						<Tooltip content="请先在人员列表添加需要值班的人员，选择人员后勾选绿色图标的为当前值班人员，值班顺序按从左到右、从上到下">
							<InformationCircleIcon className="size-4 ml-1" />
						</Tooltip>
					</div>
				}
				placeholder="请输入搜索并添加"
				listboxProps={{ emptyContent: "暂无数据" }}
				onInputChange={setSearchInput}
				selectedKey={""}
				onSelectionChange={handleUserSelectChange}
				isLoading={isSearching}
				items={searchUsers.users || []}
			>
				{(item) => (
					<AutocompleteItem key={item.id} textValue={item.name}>
						<User
							name={item.name}
							avatarProps={{
								src: item.avatar,
								size: "sm",
							}}
						/>
					</AutocompleteItem>
				)}
			</Autocomplete>
			<UserCardList
				users={selectedUsers}
				setUsers={setSelectedUsers}
				currentIndex={duty?.personIndex || 0}
			/>
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
	);
}
