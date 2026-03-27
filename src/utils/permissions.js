export const LEVELS = {
    ADMIN: 0,
    DEVELOPER: 1,
    NETWORK: 2,
    SUPPORT: 3,
    USER: 4,
};

export const ACTIONS = {
    VIEW_MENU: 'view_menu',
    VIEW: 'view',
    CREATE: 'create',
    EDIT: 'edit',
    DELETE: 'delete',
};

/**
 * Estructura:
 * modulo.submodulo.opcional
 */
export const PERMISSIONS = {

    // DASHBOARD
    dashboard: {
        view_menu: [0, 1, 2, 3, 4],
        view: [0, 1, 2, 3, 4],
    },

    // ADMINISTRACIÓN
    admin: {
        view_menu: [0, 1, 2, 3],
    },

    admin_groups: {
        view: [0, 1],
        create: [0, 1],
        edit: [0, 1],
    },

    admin_group_options: {
        view: [0, 1, 2, 3],
        create: [0, 1],
        edit: [0, 1],
        delete: [0],
    },

    // SISTEMAS
    systems: {
        view_menu: [0, 1, 2, 3],
        view: [0, 1, 2, 3],
        create: [0, 1],
    },

    systems_detail: {
        view: [0, 1, 2, 3],
        edit: [0, 1],
    },

    // INFRAESTRUCTURA (general)
    infrastructure: {
        view_menu: [0, 1, 2, 3],
        view: [0, 1, 2, 3],
        create_server: [0, 1, 2],
        create_nas: [0, 1, 2],
        create_network: [0, 1, 2],
    },

    // SERVER
    server: {
        view: [0, 1, 2, 3],
        edit: [0, 1, 2],
        access: [0, 1, 3]
    },

    // SERVER - ACCESOS
    server_access: {
        view: [0, 1, 2, 3],
        create: [0, 2],
        edit: [0, 2],
        delete: [0],
    },

    // SERVER - USUARIOS WINDOWS
    server_users: {
        view: [0, 1, 2, 3],
        create: [0, 2],
        edit: [0, 2],
        delete: [0],
    },

    // SERVER - ACTUALIZACIONES
    server_updates: {
        view: [0, 1, 2],
        create: [0, 2],
        edit: [0],
        delete: [0],
    },

    // CHECKLIST (submodulo de updates)
    server_checklist: {
        view: [0, 1, 2],
        create: [0, 1],
        edit: [0, 1],
    },

    // NAS
    nas: {
        view: [0, 1, 2, 3],
        edit: [0, 1, 2],
    },

    // NETWORK
    network: {
        view: [0, 1, 2, 3],
        edit: [0, 1, 2],
    },

    //ACTIVOS
    activos: {
        view_menu: [0],
        view: [0],
        edit: [0],
    },

    //USUARIOS
    usuarios: {
        view_menu: [0,],
        view: [0],
        edit: [0],
    },
};

export const can = (level, module, action) => {
    return PERMISSIONS[module]?.[action]?.includes(level) ?? false;
};