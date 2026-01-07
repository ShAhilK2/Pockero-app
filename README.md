<!-- Commands -->

bunx create-expo-app@latest
bunx reset-project
bunx expo prebuild
bun run ios

bunx expo install react-native-keyboard-controller

bunx expo customize babel.config.js

bun add drizzle-orm expo-sqlite@next  
bun add -D drizzle-kit

bun add drizzle-orm

bun install babel-plugin-inline-import

<!-- After that add plugin  -->

plugins: [["inline-import", { "extensions": [".sql"] }]] // <-- add this

bun i expo-drizzle-studio-plugin

bunx expo install expo-crypto

bunx expo install expo-sqlite

<!-- linkedom -->

bunx expo install linkedom
