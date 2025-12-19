/**
 * 通用图标加载器
 */
import type { DefineComponent } from "vue";

const iconCache = new Map<string, DefineComponent> ();


export async function loadNodeIcon (iconKey : string) : Promise<DefineComponent> {
    // 缓存中有
    if (iconCache.has(iconKey)) return iconCache.get(iconKey)!;

    try {
        const module = await import((`@/components/icons/Icon${iconKey}.vue`));

        iconCache.set(iconKey, module.default || module)

        return iconCache.get(iconKey)!;

    } catch (error) {
        console.error(`Failed to load icon ${iconKey}`, error);

        return iconCache.get('default')!;
    }
}