# These are compile-time canaries for TypeScript library classes

Failure to compile means TypeScript has changed the definition of a class I rely on, and it's worth investigating any classes extending the built-in for missed methods.
