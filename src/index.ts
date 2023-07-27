/**========================================================================
 *                           Libraries
 *========================================================================**/
import {NBError} from '@basaldev/blocks-backend-sdk';
import {
  UserDefaultAdapter,
  UserDefaultAdapterDependencies,
  UserDefaultAdapterOptions,
} from '@basaldev/blocks-user-service';
import {parseISO, differenceInYears, isBefore, add} from 'date-fns';

function isAdult(birthdateString: string) {
  const birthdate = parseISO(birthdateString);
  let age = differenceInYears(new Date(), birthdate);
  const isBirthdayThisYearPassed = !isBefore(
    add(birthdate, {years: age}),
    new Date()
  );
  if (!isBirthdayThisYearPassed) {
    age--;
  }

  if (age >= 18) {
    return true;
  }
  return false;
}

export class CustomUserDefaultAdapter extends UserDefaultAdapter {
  constructor(
    options: UserDefaultAdapterOptions,
    dependencies: UserDefaultAdapterDependencies
  ) {
    super(options, dependencies);
    this.createUser = {
      handler: super.createUser.handler,
      validators: {
        ...super.createUser.validators,
        ageValidator: async (logger, context): Promise<number> => {
          const {birthday} = context.body.customFields;
          if (!birthday || !isAdult(birthday)) {
            throw new NBError({
              code: 'ageValidator',
              httpCode: 400,
              message: `your age is under 18, according to your birthday: ${birthday}`,
            });
          }
          return 200;
        },
      },
    };
  }
}
