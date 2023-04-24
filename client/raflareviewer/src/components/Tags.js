import Tag from './Tag'

const Tags = ({ }) => {
    const tagLabels = ['Kahvila', 'Pikaruoka', 'Lounas', 'Brunssi', 'Kasvisvaihtoehtoja', 'Liikuntaesteetön', 'Take away']
    
    const tags = tagLabels.map(tag => {
        return <Tag key={tag} label={tag} />
    })

    return (
        <div className="tagContainer">
          {tags}
        </div>
    )
}

export default Tags