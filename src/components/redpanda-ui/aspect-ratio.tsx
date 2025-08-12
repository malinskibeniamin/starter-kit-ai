"use client";

import { AspectRatio as AspectRatioPrimitive } from "radix-ui";

function AspectRatio({
	testId,
	...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root> & {
	testId?: string;
}) {
	return (
		<AspectRatioPrimitive.Root
			data-slot="aspect-ratio"
			data-testid={testId}
			{...props}
		/>
	);
}

export { AspectRatio };
