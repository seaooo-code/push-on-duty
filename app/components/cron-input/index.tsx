import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { CheckIcon, CloseIcon } from "@heroui/shared-icons";
import type React from "react";
import { useCallback, useEffect, useState } from "react";

export interface CronExpressionInputProps {
	value?: string;
	onChange?: (value: string) => void;
	onValidation?: (isValid: boolean, nextRun?: Date) => void;
	className?: string;
}

const CronExpressionInput: React.FC<CronExpressionInputProps> = ({
	value = "",
	onChange,
	onValidation,
	className = "",
}) => {
	const [cronParts, setCronParts] = useState<string[]>([
		"",
		"",
		"",
		"",
		"",
		"",
	]);
	const [isValid, setIsValid] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [nextRunTime, setNextRunTime] = useState<Date | null>(null);
	const [description, setDescription] = useState("");

	// Cron 表达式各部分的说明（六位：秒 分 时 日 月 星期）
	const cronFields = [
		{
			id: "seconds",
			label: "秒",
			placeholder: "0-59",
			description: "秒 (0-59)",
		},
		{
			id: "minutes",
			label: "分",
			placeholder: "0-59",
			description: "分钟 (0-59)",
		},
		{
			id: "hours",
			label: "时",
			placeholder: "0-23",
			description: "小时 (0-23)",
		},
		{
			id: "dayOfMonth",
			label: "日",
			placeholder: "1-31",
			description: "日期 (1-31)",
		},
		{
			id: "months",
			label: "月",
			placeholder: "1-12",
			description: "月份 (1-12或JAN-DEC)",
		},
		{
			id: "dayOfWeek",
			label: "星期",
			placeholder: "0-7",
			description: "星期 (0-7或SUN-SAT)",
		},
	];

	const cronExamples = [
		{
			id: "every-minute",
			label: "每分钟",
			value: "0 * * * * *",
			desc: "每分钟执行一次",
		},
		{
			id: "every-hour",
			label: "每小时",
			value: "0 0 * * * *",
			desc: "每小时整点执行",
		},
		{
			id: "daily-9am",
			label: "每天9点",
			value: "0 0 9 * * *",
			desc: "每天上午9点执行",
		},
		{
			id: "weekday-9am",
			label: "工作日9点",
			value: "0 0 9 * * 1-5",
			desc: "周一到周五上午9点执行",
		},
		{
			id: "monthly-1st",
			label: "每月1号",
			value: "0 0 0 1 * *",
			desc: "每月1号午夜执行",
		},
		{
			id: "every-5min",
			label: "每5分钟",
			value: "0 */5 * * * *",
			desc: "每5分钟执行一次",
		},
		{
			id: "weekend-2pm",
			label: "周末14点",
			value: "0 0 14 * * 0,6",
			desc: "周六日下午2点执行",
		},
		{
			id: "sunday-9am",
			label: "周日9点",
			value: "0 0 9 * * 0",
			desc: "每周日上午9点执行",
		},
	];

	// 验证单个 cron 字段
	const validateCronField = useCallback(
		(value: string, fieldIndex: number): boolean => {
			if (!value || value === "*") return true;

			const ranges = [
				[0, 59], // 秒
				[0, 59], // 分
				[0, 23], // 时
				[1, 31], // 日
				[1, 12], // 月
				[0, 7], // 星期 (0和7都表示周日)
			];

			const [min, max] = ranges[fieldIndex];

			// 处理数字
			if (/^\d+$/.test(value)) {
				const num = Number.parseInt(value);
				return num >= min && num <= max;
			}

			// 处理范围 (例: 1-5)
			if (/^\d+-\d+$/.test(value)) {
				const [start, end] = value.split("-").map(Number);
				return start >= min && end <= max && start <= end;
			}

			// 处理步长 (例: */5)
			if (/^\*\/\d+$/.test(value)) {
				const step = Number.parseInt(value.split("/")[1]);
				return step > 0 && step <= max - min;
			}

			// 处理列表 (例: 1,3,5)
			if (/^(\d+,)*\d+$/.test(value)) {
				const numbers = value.split(",").map(Number);
				return numbers.every((num) => num >= min && num <= max);
			}

			// 处理月份英文缩写
			if (
				fieldIndex === 4 &&
				/^[A-Z]{3}(-[A-Z]{3})?$/.test(value.toUpperCase())
			) {
				const months = [
					"JAN",
					"FEB",
					"MAR",
					"APR",
					"MAY",
					"JUN",
					"JUL",
					"AUG",
					"SEP",
					"OCT",
					"NOV",
					"DEC",
				];
				if (value.includes("-")) {
					const [start, end] = value.toUpperCase().split("-");
					return months.includes(start) && months.includes(end);
				}
				return months.includes(value.toUpperCase());
			}

			// 处理星期英文缩写
			if (
				fieldIndex === 5 &&
				/^[A-Z]{3}(-[A-Z]{3})?$/.test(value.toUpperCase())
			) {
				const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
				if (value.includes("-")) {
					const [start, end] = value.toUpperCase().split("-");
					return weekdays.includes(start) && weekdays.includes(end);
				}
				return weekdays.includes(value.toUpperCase());
			}

			return false;
		},
		[],
	);

	// 解析星期字段，返回允许的星期数组
	const parseWeekdays = useCallback((weekStr: string): number[] => {
		if (!weekStr || weekStr === "*") return [];

		const weekdays: number[] = [];

		// 处理逗号分隔的列表
		const parts = weekStr.split(",");

		for (const part of parts) {
			if (/^\d+$/.test(part)) {
				// 单个数字
				const day = Number.parseInt(part);
				weekdays.push(day === 7 ? 0 : day); // 7转换为0（周日）
			} else if (/^\d+-\d+$/.test(part)) {
				// 范围
				const [start, end] = part.split("-").map(Number);
				for (let i = start; i <= end; i++) {
					weekdays.push(i === 7 ? 0 : i);
				}
			}
		}

		return [...new Set(weekdays)]; // 去重
	}, []);

	// 生成 cron 表达式描述
	const generateDescription = useCallback((parts: string[]): string => {
		const [sec, min, hour, day, month, week] = parts;

		if (parts.every((part) => part === "" || part === "*")) {
			return "请填写完整的 cron 表达式";
		}

		let desc = "执行时间: ";

		// 星期
		if (week && week !== "*") {
			const weekNames = [
				"周日",
				"周一",
				"周二",
				"周三",
				"周四",
				"周五",
				"周六",
			];
			if (/^\d+$/.test(week)) {
				const weekNum = Number.parseInt(week);
				desc += `${weekNames[weekNum === 7 ? 0 : weekNum]} `;
			} else if (week.includes("-")) {
				const [start, end] = week.split("-").map(Number);
				desc += `${weekNames[start === 7 ? 0 : start]}-${weekNames[end === 7 ? 0 : end]} `;
			} else if (week.includes(",")) {
				const days = week.split(",").map((num) => {
					const dayNum = Number.parseInt(num);
					return weekNames[dayNum === 7 ? 0 : dayNum];
				});
				desc += `${days.join("、")} `;
			} else if (week.startsWith("*/")) {
				const step = week.split("/")[1];
				desc += `每${step}天 `;
			}
		}

		// 月份
		if (month && month !== "*") {
			if (/^\d+$/.test(month)) {
				desc += `${month}月 `;
			} else if (month.includes("-")) {
				const [start, end] = month.split("-");
				desc += `${start}-${end}月 `;
			} else if (/^[A-Z]{3}/.test(month.toUpperCase())) {
				desc += `${month}月 `;
			} else if (month.startsWith("*/")) {
				const step = month.split("/")[1];
				desc += `每${step}个月 `;
			}
		}

		// 日期
		if (day && day !== "*") {
			if (/^\d+$/.test(day)) {
				desc += `${day}日 `;
			} else if (day.includes("-")) {
				const [start, end] = day.split("-");
				desc += `${start}-${end}日 `;
			} else if (day.startsWith("*/")) {
				const step = day.split("/")[1];
				desc += `每${step}天 `;
			}
		}

		// 小时
		if (hour && hour !== "*") {
			if (/^\d+$/.test(hour)) {
				desc += `${hour}点 `;
			} else if (hour.includes("-")) {
				const [start, end] = hour.split("-");
				desc += `${start}-${end}点 `;
			} else if (hour.startsWith("*/")) {
				const step = hour.split("/")[1];
				desc += `每${step}小时 `;
			}
		} else if (min && min !== "*") {
			desc += "每小时 ";
		}

		// 分钟
		if (min && min !== "*") {
			if (/^\d+$/.test(min)) {
				desc += `${min}分 `;
			} else if (min.includes("-")) {
				const [start, end] = min.split("-");
				desc += `${start}-${end}分 `;
			} else if (min.startsWith("*/")) {
				const step = min.split("/")[1];
				desc += `每${step}分钟 `;
			}
		} else if (hour === "*" && day === "*") {
			desc += "每分钟 ";
		}

		// 秒
		if (sec && sec !== "*" && sec !== "0") {
			if (/^\d+$/.test(sec)) {
				desc += `${sec}秒`;
			} else if (sec.startsWith("*/")) {
				const step = sec.split("/")[1];
				desc += `每${step}秒`;
			}
		} else {
			desc += "0秒";
		}

		return desc;
	}, []);

	// 计算下次执行时间（修复版）
	const calculateNextRun = useCallback(
		(parts: string[]): Date | null => {
			try {
				const now = new Date();
				const [secStr, minStr, hourStr, dayStr, monthStr, weekStr] = parts;

				// 解析各个字段的值
				const targetSec =
					secStr === "*" || secStr === "" ? 0 : Number.parseInt(secStr);
				const targetMin =
					minStr === "*" || minStr === "" ? null : Number.parseInt(minStr);
				const targetHour =
					hourStr === "*" || hourStr === "" ? null : Number.parseInt(hourStr);
				const targetDay =
					dayStr === "*" || dayStr === "" ? null : Number.parseInt(dayStr);
				const targetMonth =
					monthStr === "*" || monthStr === ""
						? null
						: Number.parseInt(monthStr);

				// 解析星期限制
				const allowedWeekdays = parseWeekdays(weekStr);

				// 从当前时间开始计算
				const nextRun = new Date(now);
				nextRun.setSeconds(targetSec);
				nextRun.setMilliseconds(0);

				// 设置分钟
				if (targetMin !== null) {
					nextRun.setMinutes(targetMin);
				}

				// 设置小时
				if (targetHour !== null) {
					nextRun.setHours(targetHour);
				}

				// 设置日期
				if (targetDay !== null) {
					nextRun.setDate(targetDay);
				}

				// 设置月份
				if (targetMonth !== null) {
					nextRun.setMonth(targetMonth - 1);
				}

				// 如果设置的时间已经过去，向前推进
				if (nextRun <= now) {
					if (
						targetMin === null &&
						targetHour === null &&
						targetDay === null &&
						targetMonth === null
					) {
						// 每分钟执行
						nextRun.setMinutes(nextRun.getMinutes() + 1);
					} else if (
						targetHour === null &&
						targetDay === null &&
						targetMonth === null
					) {
						// 每小时执行
						nextRun.setHours(nextRun.getHours() + 1);
					} else if (targetDay === null && targetMonth === null) {
						// 每天执行
						nextRun.setDate(nextRun.getDate() + 1);
					} else if (targetMonth === null) {
						// 每月执行
						nextRun.setMonth(nextRun.getMonth() + 1);
					} else {
						// 每年执行
						nextRun.setFullYear(nextRun.getFullYear() + 1);
					}
				}

				// 处理星期限制
				if (allowedWeekdays.length > 0) {
					let found = false;
					let attempts = 0;
					const maxAttempts = 7; // 最多尝试7天

					while (!found && attempts < maxAttempts) {
						const currentWeekday = nextRun.getDay();

						if (allowedWeekdays.includes(currentWeekday)) {
							// 如果当前星期匹配，检查时间是否已过
							if (nextRun > now) {
								found = true;
							} else {
								// 时间已过，跳到下一周的同一天
								nextRun.setDate(nextRun.getDate() + 7);
								found = true;
							}
						} else {
							// 找到下一个匹配的星期
							const daysToAdd = allowedWeekdays
								.map((day) => (day - currentWeekday + 7) % 7)
								.filter((diff) => diff > 0)
								.sort((a, b) => a - b)[0];

							if (daysToAdd) {
								nextRun.setDate(nextRun.getDate() + daysToAdd);
								found = true;
							} else {
								// 如果没有找到，跳到下周的第一个匹配日
								const minWeekday = Math.min(...allowedWeekdays);
								const daysToNext = (minWeekday - currentWeekday + 7) % 7 || 7;
								nextRun.setDate(nextRun.getDate() + daysToNext);
								found = true;
							}
						}

						attempts++;
					}
				}

				return nextRun;
			} catch (error) {
				console.error("计算下次执行时间出错:", error);
				return null;
			}
		},
		[parseWeekdays],
	);

	// 验证完整的 cron 表达式
	const validateCronExpression = useCallback(
		(parts: string[]): boolean => {
			// 检查是否所有字段都已填写
			const hasEmptyFields = parts.some((part) => part === "");
			if (hasEmptyFields) {
				setErrorMessage("请填写完整的 cron 表达式");
				return false;
			}

			// 验证每个字段
			for (let i = 0; i < parts.length; i++) {
				if (!validateCronField(parts[i], i)) {
					setErrorMessage(`${cronFields[i].label}字段格式错误: ${parts[i]}`);
					return false;
				}
			}

			setErrorMessage("");
			return true;
		},
		[validateCronField],
	);

	// 更新验证状态和相关信息
	const updateValidationState = useCallback(
		(parts: string[]) => {
			const valid = validateCronExpression(parts);
			setIsValid(valid);

			if (valid) {
				const nextRun = calculateNextRun(parts);
				setNextRunTime(nextRun);
				setDescription(generateDescription(parts));
				onValidation?.(true, nextRun || undefined);
			} else {
				setNextRunTime(null);
				setDescription("");
				onValidation?.(false);
			}
		},
		[
			validateCronExpression,
			calculateNextRun,
			generateDescription,
			onValidation,
		],
	);

	// 处理输入变化
	const handleInputChange = useCallback(
		(partIndex: number, value: string) => {
			const newParts = [...cronParts];
			newParts[partIndex] = value;
			setCronParts(newParts);

			const cronExpression = newParts.join(" ");
			onChange?.(cronExpression);

			// 更新验证状态
			updateValidationState(newParts);
		},
		[cronParts, onChange, updateValidationState],
	);

	// 使用预设示例
	const useExample = useCallback(
		(exampleValue: string) => {
			const parts = exampleValue.split(" ");
			setCronParts(parts);
			onChange?.(exampleValue);

			// 立即更新验证状态
			updateValidationState(parts);
		},
		[onChange, updateValidationState],
	);

	// 清空所有字段
	const clearAll = useCallback(() => {
		const emptyParts = ["", "", "", "", "", ""];
		setCronParts(emptyParts);
		onChange?.("");
		setIsValid(false);
		setErrorMessage("");
		setNextRunTime(null);
		setDescription("");
		onValidation?.(false);
	}, [onChange, onValidation]);

	// 初始化时验证
	useEffect(() => {
		if (value) {
			const parts = value.split(" ");
			if (parts.length === 6) {
				setCronParts(parts);
				// 初始化时也需要验证
				updateValidationState(parts);
			} else if (parts.length === 5) {
				// 兼容五位格式，自动添加星期字段
				const newParts = [...parts, "*"];
				setCronParts(newParts);
				updateValidationState(newParts);
			}
		}
	}, [value, updateValidationState]);

	return (
		<div className={`space-y-4 ${className}`}>
			{/* Cron 表达式输入区域 */}
			<Card>
				<CardBody className="space-y-4">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-2">
							<h3 className="text-lg font-semibold">Cron 表达式（六位）</h3>
							{isValid ? (
								<Chip
									color="success"
									variant="flat"
									startContent={<CheckIcon />}
								>
									有效
								</Chip>
							) : (
								<Chip
									color="danger"
									variant="flat"
									startContent={<CloseIcon />}
								>
									无效
								</Chip>
							)}
						</div>
						<Button size="sm" variant="flat" onPress={clearAll}>
							清空
						</Button>
					</div>

					{/* 输入字段 */}
					<div className="grid grid-cols-6 gap-2">
						{cronFields.map((field, fieldIndex) => (
							<Input
								key={field.id}
								label={field.label}
								placeholder={field.placeholder}
								value={cronParts[fieldIndex]}
								onValueChange={(value) => handleInputChange(fieldIndex, value)}
								size="sm"
								variant="bordered"
								description={field.description}
								isInvalid={
									cronParts[fieldIndex] !== "" &&
									!validateCronField(cronParts[fieldIndex], fieldIndex)
								}
								errorMessage={
									cronParts[fieldIndex] !== "" &&
									!validateCronField(cronParts[fieldIndex], fieldIndex)
										? "格式错误"
										: ""
								}
								classNames={{
									input: "text-center font-mono text-xs",
									inputWrapper: "h-10",
									description: "text-xs",
								}}
							/>
						))}
					</div>

					{/* 完整表达式显示 */}
					<div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
						<div className="flex items-center gap-2 mb-2">
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
								完整表达式:
							</span>
							<code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono border">
								{cronParts.join(" ") || "* * * * * *"}
							</code>
						</div>
						<div className="text-xs text-gray-500 mt-1">
							格式: 秒 分 时 日 月 星期
						</div>
					</div>

					{/* 错误信息 */}
					{errorMessage && (
						<div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
							<div className="flex items-center gap-2">
								<CloseIcon className="w-4 h-4" />
								{errorMessage}
							</div>
						</div>
					)}

					{/* 表达式描述 */}
					{description && isValid && (
						<div className="text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
							<div className="flex items-center gap-2">
								<CheckIcon className="w-4 h-4" />
								{description}
							</div>
						</div>
					)}

					{/* 下次执行时间 */}
					{nextRunTime && isValid && (
						<div className="text-blue-600 dark:text-blue-400 text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
							<div className="flex items-center gap-2">
								<span className="font-medium">下次执行:</span>
								<code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">
									{nextRunTime.toLocaleString("zh-CN", {
										year: "numeric",
										month: "2-digit",
										day: "2-digit",
										hour: "2-digit",
										minute: "2-digit",
										second: "2-digit",
										weekday: "short",
									})}
								</code>
							</div>
						</div>
					)}
				</CardBody>
			</Card>

			{/* 预设示例 */}
			<Card>
				<CardBody>
					<h4 className="text-md font-medium mb-3">常用示例</h4>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
						{cronExamples.map((example) => (
							<Button
								key={example.id}
								variant="flat"
								size="sm"
								onPress={() => useExample(example.value)}
								className="justify-start h-auto p-3"
							>
								<div className="text-left flex-1">
									<div className="font-medium">{example.label}</div>
									<div className="text-xs text-gray-500 mt-1">
										{example.desc}
									</div>
									<code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded mt-1 inline-block">
										{example.value}
									</code>
								</div>
							</Button>
						))}
					</div>
				</CardBody>
			</Card>

			{/* 使用说明 */}
			<Card>
				<CardBody>
					<h4 className="text-md font-medium mb-3">格式说明</h4>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
						<div className="space-y-2">
							<p>
								•{" "}
								<code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
									*
								</code>{" "}
								任意值
							</p>
							<p>
								•{" "}
								<code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
									1-5
								</code>{" "}
								范围值
							</p>
							<p>
								•{" "}
								<code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
									*/5
								</code>{" "}
								步长值
							</p>
							<p>
								•{" "}
								<code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
									1,3,5
								</code>{" "}
								列表值
							</p>
						</div>
						<div className="space-y-2">
							<p>
								•{" "}
								<code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
									JAN-DEC
								</code>{" "}
								月份缩写
							</p>
							<p>
								•{" "}
								<code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
									SUN-SAT
								</code>{" "}
								星期缩写
							</p>
							<p>
								•{" "}
								<code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
									0 0 9 * * 1-5
								</code>{" "}
								工作日9点
							</p>
							<p>
								•{" "}
								<code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
									0 0 14 * * 0,6
								</code>{" "}
								周末14点
							</p>
						</div>
					</div>
					<div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
						<strong>六位格式：</strong>秒(0-59) 分(0-59) 时(0-23) 日(1-31)
						月(1-12) 星期(0-7, 0和7都表示周日)
					</div>
				</CardBody>
			</Card>
		</div>
	);
};

export default CronExpressionInput;
