import CronExpressionInput, {
	type CronExpressionInputProps,
} from "@/app/components/cron-input";
import type { AutocompleteProps } from "@heroui/autocomplete";
import { Autocomplete } from "@heroui/autocomplete";
import { TimeInput, type TimeInputProps } from "@heroui/date-input";
import { Input, type InputProps } from "@heroui/input";
import { InputOtp, type InputOtpProps } from "@heroui/input-otp";
import { RadioGroup, type RadioGroupProps } from "@heroui/radio";
import { Select, type SelectProps } from "@heroui/select";
import {
	Controller,
	type FieldPath,
	type FieldValues,
	type UseControllerProps,
} from "react-hook-form";

export const ControllerInput = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
>(props: {
	controller: UseControllerProps<TFieldValues, TName, TTransformedValues>;
	input: InputProps;
}) => {
	return (
		<Controller
			{...props.controller}
			render={({
				field: { name, value, onChange, onBlur, ref },
				fieldState: { invalid, error },
			}) => (
				<Input
					{...props.input}
					ref={ref}
					errorMessage={error?.message}
					validationBehavior="aria"
					isInvalid={invalid}
					name={name}
					value={value}
					onBlur={onBlur}
					onChange={onChange}
				/>
			)}
		/>
	);
};

export const ControllerSelect = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
>(props: {
	controller: UseControllerProps<TFieldValues, TName, TTransformedValues>;
	select: SelectProps;
}) => {
	return (
		<Controller
			{...props.controller}
			render={({
				field: { name, value, onChange, onBlur, ref },
				fieldState: { invalid, error },
			}) => (
				<Select
					{...props.select}
					ref={ref}
					errorMessage={error?.message}
					validationBehavior="aria"
					isInvalid={invalid}
					name={name}
					selectedKeys={value}
					onBlur={onBlur}
					onSelectionChange={onChange}
				/>
			)}
		/>
	);
};

export const ControllerRadioGroup = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
>(props: {
	controller: UseControllerProps<TFieldValues, TName, TTransformedValues>;
	radioGroup: RadioGroupProps;
}) => {
	return (
		<Controller
			{...props.controller}
			render={({
				field: { name, value, onChange, onBlur, ref },
				fieldState: { invalid, error },
			}) => (
				<RadioGroup
					{...props.radioGroup}
					ref={ref}
					errorMessage={error?.message}
					validationBehavior="aria"
					isInvalid={invalid}
					name={name}
					value={value}
					onBlur={onBlur}
					onChange={onChange}
				/>
			)}
		/>
	);
};

export const ControllerTimeInput = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
>(props: {
	controller: UseControllerProps<TFieldValues, TName, TTransformedValues>;
	timeInput: TimeInputProps;
}) => {
	return (
		<Controller
			{...props.controller}
			render={({
				field: { name, value, onChange, onBlur, ref },
				fieldState: { invalid, error },
			}) => (
				<TimeInput
					{...props.timeInput}
					ref={ref}
					errorMessage={error?.message}
					validationBehavior="aria"
					isInvalid={invalid}
					name={name}
					value={value}
					onBlur={onBlur}
					onChange={onChange}
				/>
			)}
		/>
	);
};

export const ControllerInputOtp = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
>(props: {
	controller: UseControllerProps<TFieldValues, TName, TTransformedValues>;
	inputOtp: InputOtpProps;
}) => {
	return (
		<Controller
			{...props.controller}
			render={({
				field: { name, value, onChange, onBlur, ref },
				fieldState: { invalid, error },
			}) => (
				<InputOtp
					{...props.inputOtp}
					ref={ref}
					errorMessage={error?.message}
					validationBehavior="aria"
					isInvalid={invalid}
					name={name}
					value={value}
					onBlur={onBlur}
					onChange={onChange}
				/>
			)}
		/>
	);
};

export const ControllerAutocomplete = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
>(props: {
	controller: UseControllerProps<TFieldValues, TName, TTransformedValues>;
	autocomplete: AutocompleteProps;
}) => {
	return (
		<Controller
			{...props.controller}
			render={({
				field: { name, value, onChange, onBlur, ref },
				fieldState: { invalid, error },
			}) => (
				<Autocomplete
					{...props.autocomplete}
					ref={ref}
					errorMessage={error?.message}
					validationBehavior="aria"
					isInvalid={invalid}
					name={name}
					onBlur={onBlur}
					selectedKey={value}
					onSelectionChange={onChange}
				/>
			)}
		/>
	);
};

export const ControllerCronInput = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
>(props: {
	controller: UseControllerProps<TFieldValues, TName, TTransformedValues>;
	cronInput: CronExpressionInputProps;
}) => {
	return (
		<Controller
			{...props.controller}
			render={({ field, fieldState }) => (
				<div>
					<CronExpressionInput
						{...props.cronInput}
						value={field.value || ""}
						onChange={field.onChange}
					/>
					{fieldState.error && (
						<div className="text-danger text-sm mt-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
							{fieldState.error.message}
						</div>
					)}
				</div>
			)}
		/>
	);
};
