import { expect } from 'chai';

import { Validator } from 'src/validation/Validator';
import { ValidationContext } from 'src/validation/ValidationContext';

describe('The Validator', () => {
	describe('Message parsing', () => {
		it('should replace the predefined token correctly in the parseMessage() function', () => {
			const context = new ValidationContext([ '--arg1--', '--arg2--', '--arg3--' ], '--property--', '--target--', '--value--');
			const originalMessage = 'The $property should equal $arg1 or $arg2 - as target $target - but has $value';
			const parsedMessage = Validator.parseMessage(originalMessage, context);

			expect(parsedMessage).to.be.a('String');

			expect(parsedMessage).to.contain(context.property).and.not.contain('$property');
			expect(parsedMessage).to.contain(context.args[0]).and.not.contain('$arg1');
			expect(parsedMessage).to.contain(context.target).and.not.contain('$target');
			expect(parsedMessage).to.contain(context.value).and.not.contain('$value');
		});
	});

	describe('Type-Checking', () => {
		it('should return true when the correct type is given', () => {
			expect(Validator.checkType('string', String)).to.equal(true);
		});

		it('should return false when the wrong type is given', () => {
			expect(Validator.checkType(12345, String)).to.equal(false);
		});
	});
});