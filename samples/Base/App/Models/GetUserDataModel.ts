import {Model, ModelProp} from "../../../../lib/src";
import {tsV} from "../../../../lib/src/validation";

export class GetUserDataRequest extends Model {
	@ModelProp()
	@tsV.IsDefined({ message: "The userName must be defined!" })
	@tsV.IsNotEmpty({ message: "The userName must not be empty!" })
	@tsV.IsString({ message: "The userName must be a string" })
	public userName: string;
}