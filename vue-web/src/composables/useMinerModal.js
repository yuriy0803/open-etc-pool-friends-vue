import { ref } from 'vue';

const isMinerModalOpen = ref(false);
const selectedMinerAddress = ref('');
const initialMinerData = ref(null);

export function useMinerModal() {
  function openMinerModal(address, extraData = null) {
    if (!address) return;
    selectedMinerAddress.value = address.trim();
    initialMinerData.value = extraData;
    isMinerModalOpen.value = true;
  }

  function closeMinerModal() {
    isMinerModalOpen.value = false;
  }

  return {
    isMinerModalOpen,
    selectedMinerAddress,
    initialMinerData,
    openMinerModal,
    closeMinerModal
  };
}
