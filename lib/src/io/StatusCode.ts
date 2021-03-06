export enum StatusCodes {
	/**
	 * 100
	 */
	Continue = 100,
	SwitchProtocols = 101,
	Processing = 102,
	EarlyHints = 103,

	/**
	 * 200
	 */
	Ok = 200,
	Created = 201,
	Accepted = 202,
	NonAuthorativeInformation = 203,
	NoContent = 204,
	ResetContent = 205,
	PartialContent = 206,
	AlreadyReported = 208,
	ImUsed = 226,

	/**
	 * 300
	 */
	MultipleChoices = 300,
	MovedPermanently = 301,
	Found = 302,
	SeeOther = 303,
	NotModified = 304,

	TempRedirect = 307,
	PermRedirect = 308,

	/**
	 * 400
	 */
	BadRequest = 400,
	Unauthorized = 401,
	PaymentRequired = 402,
	Forbidden = 403,
	NotFound = 404,
	MethodNotAllowed = 405,
	NotAccepable = 406,
	RequestTimeout = 408,
	Conflict = 409,
	Gone = 410,
	LengthRequired = 411,
	PreconditionFailed = 412,
	PayloadTooLarge = 413,
	UriTooLong = 414,
	UnsupportedMediaTyppe = 415,
	ExpectationFailed = 417,
	MisdirectedRequest = 421,
	UnprocessableEntity = 422,
	Locked = 423,
	FailedDependency = 424,
	UpgradeRequired = 426,
	TooManyRequests = 429,
	RequestHeaderTooLarge = 431,
	UnavailableForLeagalReasons = 451,

	/**
	 * 500
	 */
	InternalServerError = 500,
	NotImplemented = 501,
	BadGateway = 502,
	ServiceUnavailable = 503,
	GatewayTimeout = 504,
	InsufficientStorage = 507,
	LoopDetected = 508
}
