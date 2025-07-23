import { type RadioProps, useRadio } from "@heroui/radio";
import { cn } from "@heroui/theme";
import { VisuallyHidden } from "@react-aria/visually-hidden";

export const CustomRadio = (props: RadioProps) => {
	const {
		Component,
		children,
		description,
		getBaseProps,
		getWrapperProps,
		getInputProps,
		getLabelProps,
		getLabelWrapperProps,
		getControlProps,
	} = useRadio(props);

	return (
		<Component
			{...getBaseProps()}
			className={cn(
				"flex-1 group inline-flex items-center hover:opacity-70 active:opacity-50 justify-between flex-row-reverse tap-highlight-transparent",
				"cursor-pointer border-1 border-default rounded-lg gap-4 px-4 py-1.5",
				"data-[selected=true]:border-primary",
			)}
		>
			<VisuallyHidden>
				<input {...getInputProps()} />
			</VisuallyHidden>
			<span {...getWrapperProps()}>
				<span {...getControlProps()} />
			</span>
			<div {...getLabelWrapperProps()}>
				{children && <span {...getLabelProps()}>{children}</span>}
				{description && (
					<span className="text-small text-foreground opacity-70">
						{description}
					</span>
				)}
			</div>
		</Component>
	);
};
