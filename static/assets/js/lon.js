const translations = {
    en:{
        home: 'home',
        user: 'user',
        add: 'add',
        contact: 'contact',
        Faceboock: 'Faceboock',
        github: 'github',
        email: 'email',
        english: 'english',
        français: 'franch',
        arabic: 'arabic'
    },
    fr:{
        home: 'La page principal',
        user: 'client',
        add: 'ajouter',
        contact: 'contact',
        Faceboock: 'Faceboock',
        github: 'github',
        email: 'email',
        english: 'anglais',
        français: 'français',
        arabic: 'arabic'
    },
    ar:{
        home: 'الصفحة الرئيسية',
        user:'المستعمل',
        add:'اضافة',
        contact:'اتصل بنا',
        Faceboock:'فيسبوك',
        github:'جيتهوب',
        email:'ايميل',
        english:'الانجليزية',
        français: 'الفرنسية',
        arabic:'العربية'
    },
};
const languageSelector = document.querySelector('select')
languageSelector.addEventListener('change', (event) => {
    setLanguage(event.target.value);
    localStorage=setItem('lang',event.target.value)
});
document.addEventListener('DOMContentLoaded', ()=>{
    const language = localStorage.getItem("lang");
    setLanguage(language);
});
const setLanguage = (language) => {
    const elements = document.querySelectorAll("[data-i18n]");

    // Check if the selected language exists in the translations object
    if (translations[language]) {
        elements.forEach((element) => {
            const translationKey = element.getAttribute("data-i18n");

            // Check if the translation key exists for the selected language
            if (translations[language][translationKey]) {
                element.textContent = translations[language][translationKey];
            } else {
                console.error(`Translation key '${translationKey}' not found for language '${language}'.`);
            }
        });

        if (language === 'ar') {
            document.dir = 'rtl';
        } else {
            document.dir = 'ltr';
        }
    }
};
