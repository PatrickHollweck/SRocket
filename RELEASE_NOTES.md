# SRocket release notes.

Here are the release notes for srocket.
Each new release is denoted like this:

`## <VERSION_NUMBER> - <RELEASE_TYPE>`

-   `VERSION_NUMBER` is the number of the release.
-   `RELEASE_TYPE` is the semver name for the type of the update.

## SEMVER Policy

-   We try to only break backwards compatibility in major releases.
-   Minor releases will be used to add features
-   Patch to fix bugs / chore work.
-   Non-Public / Non-API stuff like build scripts / config may be changed in any release.

This policy will be enforced starting from Version@2.2.1

---

## Version 2.2.1 - patch

-   Fixes
    -   Fixed missing version field in package.json

## Version 2.2.0 - minor

-   Features
    -   Added the `SRequest.validation` method which allows for the request
        data to be validated in a type-safe manner.

## Version 2.1.1 - patch

-   Fixes
    -   Add missing export for `SEvent`

## Version 2.1.0 - minor

-   Features - Better Route types - Better validation

## Version 2.0 - major

-   Major rewrite from @1.0

---

There are no release notes from before 2.0
