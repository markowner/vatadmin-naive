import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useTagsViewStore = defineStore("tagsview", {
    state: () => (
        {
            visitedViews: []
        }
    ),
    actions: {
        //添加路由标签
        addView(view: Object) {
            if (this.visitedViews.some(v => v.path === view.path)) return
            this.visitedViews.push(view)
        },
        //删除路由标签
        delView(view: Object) {
            for (const [i, v] of this.visitedViews.entries()) {
                if (v.path === view.path) {
                    this.visitedViews.splice(i, 1)
                    break
                }
            }
        },
        //删除其他路由标签
        delOtherView(view: Object) {
            this.visitedViews = this.visitedViews.filter(v => {
                return v.meta.affix || v.path === view.path
            })
        },
        //删除所有路由标签
        delAllView() {
            const affixTags = this.visitedViews.filter(tag => tag.meta.affix)
            this.visitedViews = affixTags
        }
    },
    getters: {
        getVisitedViews: (state) => state.visitedViews
    }
});