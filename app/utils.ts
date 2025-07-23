import type { TimeValue } from "@react-types/datepicker";

export const calculateEndDateTime = (
	startDayWeek: Set<string>,
	startDayTime: TimeValue,
) => {
	// 获取第一个选中的日期
	const firstStartDay = Array.from(startDayWeek)[0];

	if (!firstStartDay || !startDayTime) {
		return {
			formated: "****",
			row: {
				endHour: 0,
				endMinute: 0,
			},
		};
	}

	// 将字符串转换为数字 (0-6 对应 周日到周六)
	const startDay = Number(firstStartDay);

	// 星期名称映射 (0-6 对应 周日到周六)
	const dayNames = [
		"星期日",
		"星期一",
		"星期二",
		"星期三",
		"星期四",
		"星期五",
		"星期六",
	];

	// 结束日期和开始日期保持一致
	let endDayWeek = startDay;

	// 计算结束时间（开始时间的前一分钟）
	let endHour = startDayTime.hour;
	let endMinute = startDayTime.minute - 1;

	// 处理分钟数为负的情况
	if (endMinute < 0) {
		endMinute = 59;
		endHour = endHour - 1;
	}

	// 处理小时数为负的情况
	if (endHour < 0) {
		endHour = 23;
		// 如果小时往前推，日期也要往前推一天
		endDayWeek = endDayWeek - 1;
		if (endDayWeek < 0) {
			endDayWeek = 6;
		}
	}

	// 格式化时间
	const endDayTime = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;

	return {
		formated: `${dayNames[endDayWeek]} ${endDayTime}`,
		row: {
			endHour,
			endMinute,
		},
	};
};
