// The node-uuid module supplied by typings doesn't work because it can't find the Buffer type.
// This is the only function we are using anyway.

declare module "node-uuid" {
    export function v4():string;
}
