export const talesRegistry = [
  {
    id: "osrase_malone_zadig",
    title: "Osrase : Malone & Zadig",
    subtitle: "The Last Horizon",
    // L'image est maintenant chargée depuis Wix
    cover: "https://static.wixstatic.com/media/b9ad46_9fcfea21c381472e97a9a9bc10386509~mv2.jpg", 
    description: "Dans un futur où le silence est devenu la ressource la plus précieuse, une archiviste découvre un enregistrement qui pourrait changer l'histoire de l'humanité. Une épopée sonore immersive.",
    
    credits: {
      creative: [
        { title: 'Tale', people: [{ name: 'Johnny Delaveau', role: 'Auteur principal' }] },
        { title: 'Sound', people: [{ name: 'Quentin Querel', role: 'Compositeur principal' }] },
        { title: 'Illustration', people: [{ name: 'Dupont Dupond', role: 'Illustrateur principal' }] }
      ],
      voices: [
        { name: 'Dupont Dupond', role: 'Malone' },
        { name: 'Dupont Dupond', role: 'Zadig' },
        { name: 'Dupont Dupond', role: 'Zora' },
        { name: 'Dupont Dupond', role: 'Albar' }
      ]
    },

    chapters: [
      { 
        id: "1", 
        title: "Chapitre 1 · Le réveil", 
        summary: "Malone ouvre les yeux sur une cité qui gronde tandis que Zadig prépare la révolte.", 
        cover: "https://picsum.photos/seed/osrase1/800/450",
        jsonUrl: "https://b9ad46aa-02e5-47d9-af20-605a8f1641a2.usrfiles.com/ugd/b9ad46_6875273c6517475982bd23e3e58d52dc.json"
      },
      { 
        id: "2", 
        title: "Chapitre 2 · Les machines", 
        summary: "Le bruit des pistons couvre les conversations. Il faut hurler pour se faire entendre.", 
        cover: "https://picsum.photos/seed/osrase2/800/450",
        jsonUrl: null 
      },
      { 
        id: "23", 
        title: "Chapitre 23 · Être libre", 
        summary: "Le dénouement approche. Zora doit faire un choix.", 
        // J'utilise la même image Wix pour la couverture du chapitre (tu pourras en mettre une autre spécifique plus tard)
        cover: "https://static.wixstatic.com/media/b9ad46_9fcfea21c381472e97a9a9bc10386509~mv2.jpg",
        jsonUrl: "https://b9ad46aa-02e5-47d9-af20-605a8f1641a2.usrfiles.com/ugd/b9ad46_d6a3b92e25014d75a19337bfe796d43d.json"
      }
    ]
  }
];

export const getTale = (id) => talesRegistry.find(t => t.id === id);
export const getChapterUrl = (taleId, chapterId) => {
  const tale = getTale(taleId);
  const chapter = tale?.chapters.find(c => c.id === chapterId);
  return chapter?.jsonUrl;
};