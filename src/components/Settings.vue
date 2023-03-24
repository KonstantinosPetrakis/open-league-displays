<script setup>
import { ref } from "vue";
import OffCanvas from "./ui/OffCanvas.vue";
import SettingIcon from "./svgs/SettingIcon.vue";

const information = ref({});
window.api.getInformation().then(info => information.value = info);

</script>

<style scoped>
table {
    text-align: left;
    border: 1px solid;
    border-collapse: collapse;
}
th, td {
    border: 1px solid;
    padding: .5rem;
}
</style>

<template>
    <off-canvas>
        <setting-icon> </setting-icon>
        <template #off-canvas>
            <h2> Settings </h2>
            <table>
                <tr> 
                    <th> LOL Version </th>
                    <td> {{ information.version }} </td>
                </tr>
                <tr>
                    <th> Champions count </th>
                    <td> {{ information.championsCount }}</td>
                </tr>
                <tr>
                    <th> Skins count </th>
                    <td> {{ information.skinsCount }} </td>
                </tr>
            </table>
        </template>
    </off-canvas>
</template>