import { Scene } from "@/types/story";

export const INITIAL_SCENE_ID = "start";

export const STORY_SCENES: Record<string, Scene> = {
  start: {
    id: "start",
    chapter: "Babak 1 • 16.15 WIB",
    title: "Alarm Badai di Pos Relawan",
    narration:
      "Awan gelap pekat menutup langit dan angin kencang mulai mengguncang atap pos. Dua laporan masuk bersamaan: Pak Darma terombang-ambing karena mesin perahunya mati di tengah rawa, sementara Sari terluka ringan di pergelangan kaki di jalur bukit sebelah timur.",
    mood: "tense",
    choices: [
      {
        id: "c1",
        label: "Nyalakan perahu motor dan menuju ke arah rawa terlebih dahulu",
        nextSceneId: "lake_rescue",
        clueObtained: "Posisi Perahu Pak Darma",
      },
      {
        id: "c2",
        label: "Ambil kotak P3K dan senter, lalu naik ke jalur bukit timur",
        nextSceneId: "hill_rescue",
        clueObtained: "Titik Lokasi Sari",
      },
    ],
  },

  lake_rescue: {
    id: "lake_rescue",
    chapter: "Babak 2 • 16.45 WIB",
    title: "Gelombang di Tengah Rawa",
    narration:
      "Permukaan air mulai beriak keras tertiup angin. Kamu menemukan perahu Pak Darma sekitar 400 meter dari dermaga. Air perlahan masuk ke badan perahu, dan indikator bahan bakarmu tinggal seperempat.",
    mood: "tense",
    choices: [
      {
        id: "c3",
        label: "Bersiap melakukan evakuasi di tengah gelombang rawa",
        nextSceneId: "ending_safe_lake",
        clueObtained: "Pak Darma Ditemukan",
      },
      {
        id: "c4",
        label: "Tunggu tim bantuan pusat sebelum mendekat ke tengah rawa",
        nextSceneId: "ending_storm_delay",
      },
    ],
  },

  hill_rescue: {
    id: "hill_rescue",
    chapter: "Babak 2 • 16.45 WIB",
    title: "Jalur Licin di Lereng Bukit",
    narration:
      "Hujan deras mulai turun membasahi bebatuan. Kamu menemukan Sari berteduh di balik tebing kecil. Kakinya bengkak, dan jalur turun akan semakin licin jika hujan makin lebat.",
    mood: "eerie",
    choices: [
      {
        id: "c5",
        label: "Bersiap membantu Sari turun melewati lereng basah",
        nextSceneId: "ending_safe_hill",
        clueObtained: "Sari Ditemukan di Lereng",
      },
      {
        id: "c6",
        label: "Hubungi pos bawah untuk mengirim tandu sebelum bergerak turun",
        nextSceneId: "ending_storm_delay",
      },
    ],
  },

  ending_safe_lake: {
    id: "ending_safe_lake",
    chapter: "Akhir Cerita • Aman & Terkendali",
    title: "Sandar Selamat Sebelum Badai Puncak",
    narration:
      "Dengan persiapan matang dan langkah terukur, kamu dan Pak Darma berhasil merapat ke dermaga dengan aman sebelum hujan terderas mengguyur rawa.",
    mood: "calm",
    isEnding: true,
    endingType: "good",
    choices: [],
  },

  ending_bold_lake: {
    id: "ending_bold_lake",
    chapter: "Akhir Cerita • Lolos Penuh Risiko",
    title: "Tiba Lebih Cepat dengan Lambung Tergores",
    narration:
      "Kamu dan Pak Darma berhasil merapat ke dermaga sebelum hujan terderas turun, meski beberapa hantaman ombak sempat membuat bagian depan perahu retak dan perlu perbaikan.",
    mood: "tense",
    isEnding: true,
    endingType: "mystery",
    choices: [],
  },

  ending_safe_hill: {
    id: "ending_safe_hill",
    chapter: "Akhir Cerita • Aman & Terkendali",
    title: "Turun Stabil di Tengah Guyuran Hujan",
    narration:
      "Dengan kaki yang sudah disangga dan langkah yang hati-hati, kamu dan Sari tiba di pos bawah dengan selamat meski hujan membasahi seluruh jalur.",
    mood: "calm",
    isEnding: true,
    endingType: "good",
    choices: [],
  },

  ending_bold_hill: {
    id: "ending_bold_hill",
    chapter: "Akhir Cerita • Lolos Penuh Risiko",
    title: "Sampai di Kaki Bukit dalam Guyuran Hujan",
    narration:
      "Kalian berhasil turun lebih cepat dari perkiraan sebelum jalur tertutup genangan, meski sempat terpeleset sekali di tanjakan berbatu dan tiba dalam kondisi basah kuyup.",
    mood: "tense",
    isEnding: true,
    endingType: "mystery",
    choices: [],
  },

  ending_storm_delay: {
    id: "ending_storm_delay",
    chapter: "Akhir Cerita • Berlindung Darurat",
    title: "Bertahan hingga Cuaca Mereda",
    narration:
      "Hujan deras dan angin kencang memaksa kalian menepi ke titik berlindung terdekat demi keselamatan. Proses lanjutan baru dapat dilakukan setelah cuaca sedikit mereda.",
    mood: "eerie",
    isEnding: true,
    endingType: "mystery",
    choices: [],
  },
};