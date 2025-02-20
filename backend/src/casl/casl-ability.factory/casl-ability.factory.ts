import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
  MongoQuery,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Action } from '../../auth/enums/actions.enum';
import { User } from '../../users/entities/user.entity';
import { userHasAnyRole } from 'src/auth/helpers/auth.helpers';
import { ClientRole } from 'src/auth/enums/role.enum';

type Subjects = InferSubjects<typeof User> | 'all';

type PossibleAbilities = [Action, Subjects];
type Conditions = MongoQuery;

export type AppAbility = MongoAbility<PossibleAbilities, Conditions>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, build } = new AbilityBuilder(
      createMongoAbility<PossibleAbilities, Conditions>,
    );

    console.log('CaslAbilityFactory user: ', user);

    // Admin can do everything
    if (userHasAnyRole(user, [ClientRole.Admin])) {
      can(Action.Manage, 'all'); // read-write access to everything
    } else {
      can(Action.Read, 'all'); // read-only access to everything
    }

    can(Action.UpdateOwn, User, { id: user.id });

    // // For each role the user has, add each permission
    // user.roles?.forEach((role) => {
    //   role.permissions?.forEach((permission: Permission) => {
    //     // Here we assume permission.action and permission.subject exist,
    //     // and permission.conditions is optional.
    //     can(
    //       permission.name as Action,
    //       permission.subject as ExtractSubjectType<Subjects>,
    //       permission.conditions || {},
    //     );
    //   });
    // });

    return build({
      // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
