<h2 id="publications" style="margin: 2px 0px -3px;">Selected Publications</h2>

<div class="publications">
<ol class="bibliography">

{% for link in site.data.publications.main %}

<li{% if link.id %} id="{{ link.id }}"{% endif %}>
<div class="pub-row">
  <div class="col-sm-3 abbr" style="position: relative;padding-right: 15px;padding-left: 15px;">
    {% if link.image %} 
    <img src="{{ link.image | relative_url }}"{% if link.image_size %} width="{{ link.image_size[0] }}" height="{{ link.image_size[1] }}"{% endif %} class="teaser img-fluid z-depth-1" alt="{{ link.title }} teaser">
    {% if link.conference_short and site.style_badges %} 
    <abbr class="badge">{{ link.conference_short }}</abbr>
    {% endif %}
    {% endif %}
  </div>
  <div class="col-sm-9" style="position: relative;padding-right: 15px;padding-left: 20px;">
      <div class="title"><a href="{{ link.pdf }}">{{ link.title }}</a></div>
      <div class="author">{{ link.authors }}</div>
      <div class="periodical"><em>{{ link.conference }}</em>
      </div>
    <div class="links">
      {% if link.pdf %} 
      <a href="{{ link.pdf }}" class="btn btn-sm z-depth-0" role="button" style="font-size:12px;">PDF</a>
      {% endif %}
      {% if link.code %} 
      <a href="{{ link.code }}" class="btn btn-sm z-depth-0" role="button" style="font-size:12px;">Code</a>
      {% endif %}
      {% if link.dataset %} 
      <a href="{{ link.dataset }}" class="btn btn-sm z-depth-0" role="button" style="font-size:12px;">Dataset</a>
      {% endif %}
      {% if link.page %} 
      <a href="{{ link.page }}" class="btn btn-sm z-depth-0" role="button" style="font-size:12px;">Project Page</a>
      {% endif %}
      {% if link.bibtex %} 
      <a href="{{ link.bibtex }}" class="btn btn-sm z-depth-0" role="button" style="font-size:12px;">BibTex</a>
      {% endif %}
      {% if link.notes %} 
      <span class="pub-note">{{ link.notes }}</span>
      {% endif %}
      {% if link.others %} 
      {{ link.others }}
      {% endif %}
    </div>
  </div>
</div>
</li>
<br>

{% endfor %}

</ol>
</div>
