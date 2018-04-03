export function doAssert(done: any, fn: Function, finishWithDone: boolean = true) {
	try {
		fn();

		if (finishWithDone) {
			done();
		}
	} catch (e) {
		done.fail(e);
	}
}
