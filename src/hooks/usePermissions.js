import { can as baseCan, LEVELS } from '@/utils/permissions';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

export const usePermissions = () => {
    const [user, setUser] = useState(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        try {
            const userData = Cookies.get('user_data');
            setUser(userData ? JSON.parse(userData) : null);
        } catch (error) {
            console.error('Error parsing user_data cookie', error);
            setUser(null);
        } finally {
            setLoaded(true);
        }
    }, []);

    const userLevel = user?.level ?? LEVELS.USER;

    const can = (module, action) => {
        return baseCan(userLevel, module, action);
    };

    const isAdmin = userLevel === LEVELS.ADMIN;
    const isDeveloper = userLevel === LEVELS.DEVELOPER;

    const canAny = (checks = []) => {
        return checks.some(([module, action]) =>
            baseCan(userLevel, module, action)
        );
    };

    const canAll = (checks = []) => {
        return checks.every(([module, action]) =>
            baseCan(userLevel, module, action)
        );
    };

    return {
        user,
        level: userLevel,
        can,
        canAny,
        canAll,
        isAdmin,
        isDeveloper,
        isLoaded: loaded
    };
};