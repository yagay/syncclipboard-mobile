"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("expo/config-plugins");
const withForegroundService = (config) => {
    return (0, config_plugins_1.withAndroidManifest)(config, (modConfig) => {
        const manifest = modConfig.modResults.manifest;
        // Add FOREGROUND_SERVICE permission
        if (!manifest['uses-permission']) {
            manifest['uses-permission'] = [];
        }
        const permissions = manifest['uses-permission'];
        const addPermission = (name) => {
            if (!permissions.some((p) => p.$?.['android:name'] === name)) {
                permissions.push({ $: { 'android:name': name } });
                console.log(`✅ Added permission: ${name}`);
            }
        };
        addPermission('android.permission.FOREGROUND_SERVICE');
        // The foreground service keeps the user-enabled clipboard listener alive.
        // It is not a finite data transfer, so declaring it as dataSync would make
        // Android 15+ stop it after the platform's 6-hour quota is exhausted.
        addPermission('android.permission.FOREGROUND_SERVICE_SPECIAL_USE');
        // Register Service in <application>
        const application = manifest.application?.[0];
        if (application) {
            if (!application.service) {
                application.service = [];
            }
            const serviceClassName = 'expo.modules.foregroundservice.SyncForegroundService';
            if (!application.service.some((s) => s.$?.['android:name'] === serviceClassName)) {
                application.service.push({
                    $: {
                        'android:name': serviceClassName,
                        'android:enabled': 'true',
                        'android:exported': 'false',
                        'android:stopWithTask': 'false',
                        'android:foregroundServiceType': 'specialUse',
                    },
                    property: [
                        {
                            $: {
                                'android:name': 'android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE',
                                'android:value': 'User-enabled continuous cross-device clipboard monitoring',
                            },
                        },
                    ],
                });
                console.log(`✅ Registered service: ${serviceClassName}`);
            }
        }
        return modConfig;
    });
};
exports.default = withForegroundService;
