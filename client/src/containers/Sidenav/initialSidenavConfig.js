module.exports = {
	groupLinks: [
    {
      header: "Collections",
      dividerBottom: true,
      links: [
        {
            name: "sampleCollectionPage",
            route: "/sample-collection",
            icon: "format_list_bulleted",
            text: "Sample Collection 1"
        },
        {
            name: "sampleCollectionPage2",
            route: "/sample-collection",
            icon: "format_list_bulleted",
            text: "Sample Collection 2"
        }
      ]
    },
    {
      header: "Setup",
      dividerBottom: false,
      links: [
        {
            name: "collection-list",
            route: "/collection-list",
            icon: "apps",
            text: "Collections"
        },
        {
            name: "sidenav-setup",
            route: "/sidenav-setup",
            icon: "settings",
            text: "Sidenav"
        },
        {
            name: "app-settings",
            route: "/app-settings",
            icon: "computer",
            text: "App"
        }
      ]
    }
  ]
}