import re

content = open('src/components/OrdersList.tsx').read()

old_link2 = """                                <a 
                                  href={`?orderId=${order.id}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-indigo-600 hover:text-indigo-800 inline-flex items-center" 
                                  title="Open individual order workspace in new tab"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>"""

new_link2 = """                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectOrderDetails(order);
                                  }}
                                  className="text-indigo-600 hover:text-indigo-800 inline-flex items-center" 
                                  title="Open order workspace tab"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>"""

content = content.replace(old_link2, new_link2)

open('src/components/OrdersList.tsx', 'w').write(content)
