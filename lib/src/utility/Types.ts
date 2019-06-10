export const extractAck = (data: any): { hasAck: boolean; ack: Function | null } => {
	if (Array.isArray(data)) {
		const lastArg = data[data.length - 1];
		const hasAck = typeof lastArg === "function";

		return {
			hasAck,
			ack: hasAck ? lastArg : null
		};
	}

	return {
		hasAck: false,
		ack: null
	};
};
