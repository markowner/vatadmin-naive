import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useStore = defineStore("main", () => {
    const data = ref({ isCollapse: false , device: 'pc'});
    const extra = ref({});

    function setData(key, value) {
        data.value[key] = value
    }

    function setExtra(value) {
        extra.value = value || {}
    }

    const device = computed(() => {
        return data.value.device
    })

    const collapse = computed(() => {
        return data.value.isCollapse
    })

    return { data, extra, setData, setExtra, device, collapse };
});