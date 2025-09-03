import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useStore = defineStore("main", () => {
    const data = ref({ isCollapse: false , device: 'pc'});

    function setData(key: any, value: any) {
        data.value[key] = value
    }

    const device = computed(() => {
        return data.value.device
    })

    const collapse = computed(() => {
        return data.value.isCollapse
    })

    return { data, setData, device, collapse };
});